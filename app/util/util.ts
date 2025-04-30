import * as bitcoin from "bitcoinjs-lib";
import Wallet, { Address } from "sats-connect";
import { fetchUTXOs, fetchValidateAddress } from "~/api/api";
import { nBTC_ADDR } from "~/constants";
import { UTXO, ValidateAddressI } from "~/types";

const sendTxn = async (bitcoinAddress: Address, sendAmount: number, opReturnInput: string) => {
	try {
		// fetch utxos
		const utxos: UTXO[] = await fetchUTXOs(bitcoinAddress.address);
		if (!utxos?.length) {
			// TODO: Also add better notification handling. Task -> https://github.com/gonative-cc/byield/issues/21
			throw new Error("utxos not found.");
		}
		// validate address
		const validateAddress: ValidateAddressI = await fetchValidateAddress(bitcoinAddress.address);
		if (!validateAddress) {
			throw new Error("Not able to find validate the address.");
		}
		const network = bitcoin.networks.testnet;
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
			throw new Error("Insufficient funds for transaction and fee.");
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

export { sendTxn };
