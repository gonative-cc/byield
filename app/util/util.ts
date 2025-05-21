import { MIST_PER_SUI } from "@mysten/sui/utils";
import * as bitcoin from "bitcoinjs-lib";
import Wallet, { Address } from "sats-connect";
import { fetchUTXOs, fetchValidateAddress } from "~/api/api";
import { nBTC_ADDR } from "~/constants";
import { ToastFunction } from "~/hooks/use-toast";
import { UTXO, ValidateAddressI } from "~/types";

const mistToSui = (amountInMist: number): number => {
	return amountInMist / Number(MIST_PER_SUI);
};

const suiToMist = (amountInSUI: number): bigint => {
	return BigInt(Math.floor(amountInSUI * Number(MIST_PER_SUI)));
};

const sendTxn = async (
	bitcoinAddress: Address,
	sendAmount: number,
	opReturnInput: string,
	network: bitcoin.Network,
	toast?: ToastFunction,
) => {
	try {
		// fetch utxos
		const utxos: UTXO[] = await fetchUTXOs(bitcoinAddress.address);
		if (!utxos?.length) {
			console.error("utxos not found.");
			toast?.({
				title: "UTXO",
				description: "utxos not found.",
				variant: "destructive",
			});
		}
		// validate address
		const validateAddress: ValidateAddressI = await fetchValidateAddress(bitcoinAddress.address);
		if (!validateAddress) {
			console.error("Not able to find validate the address.");
			toast?.({
				title: "Address",
				description: "Not able to find validate the address.",
				variant: "destructive",
			});
		}
		const psbt = new bitcoin.Psbt({ network });

		psbt.addInput({
			hash: utxos?.[0]?.txid,
			index: utxos?.[0]?.vout,
			witnessUtxo: {
				script: Buffer.from(validateAddress.scriptPubKey, "hex"),
				value: utxos?.[0]?.value,
			},
		});

		psbt.addOutput({
			// TODO: replace hardcoded P2WPKH address for nBTC deposits
			address: nBTC_ADDR,
			value: sendAmount,
		});

		// Add OP_RETURN output
		const opReturnData = Buffer.from(opReturnInput, "hex");
		const opReturnScript = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, opReturnData]);
		psbt.addOutput({
			script: opReturnScript,
			value: 0,
		});
		const fee = 500;
		const changeAmount = utxos?.[0]?.value - sendAmount - fee;
		if (changeAmount <= 0) {
			console.error("Insufficient funds for transaction and fee.");
			toast?.({
				title: "Balance",
				description: "Insufficient funds for transaction and fee.",
				variant: "destructive",
			});
		}
		psbt.addOutput({
			address: bitcoinAddress.address,
			value: changeAmount,
		});

		const txHex = psbt.toBase64();
		await Wallet.request("signPsbt", {
			psbt: txHex,
			signInputs: {
				[bitcoinAddress.address]: [0],
			},
			broadcast: true,
		});
	} catch (error) {
		console.error(error);
	}
};

const trimAddress = (address: string): string => {
	return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export { sendTxn, trimAddress, suiToMist, mistToSui };
