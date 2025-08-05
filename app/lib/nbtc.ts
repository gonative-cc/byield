import { networks, opcodes, Psbt, script, type Network } from "bitcoinjs-lib";
import Wallet from "sats-connect";
import type { Address, RpcResult } from "sats-connect";
import { fetchUTXOs, fetchValidateAddress } from "~/api/btcrpc";
import type { UTXO, ValidateAddressI } from "~/api/btcrpc";
import type { ToastFunction } from "~/hooks/use-toast";
import mintTestNetConfig from "~/config/mint/contracts-testnet.json";
import mintMainNetConfig from "~/config/mint/contracts-mainnet.json";
import { isMainNetNetwork } from "./appenv";

export const PRICE_PER_NBTC_IN_SUI = 25000n;
export const NBTC_COIN_TYPE =
	"0x5419f6e223f18a9141e91a42286f2783eee27bf2667422c2100afc7b2296731b::nbtc::NBTC";

// TODO: This needs node pollyfill. Find workaround for this.
export async function nBTCMintTxn(
	bitcoinAddress: Address,
	sendAmountInSatoshi: number,
	opReturnInput: string,
	toast?: ToastFunction,
): Promise<RpcResult<"signPsbt"> | undefined> {
	try {
		const isMainNetMode = isMainNetNetwork();
		const network: Network = isMainNetMode ? networks.bitcoin : networks.testnet;
		const depositAddress = isMainNetMode
			? mintMainNetConfig.mint.depositAddress
			: mintTestNetConfig.mint.depositAddress;

		const utxos: UTXO[] = await fetchUTXOs(bitcoinAddress.address);
		if (!utxos?.length) {
			console.error("utxos not found.");
			toast?.({
				title: "UTXO",
				description: "UTXOs not found for this address.",
				variant: "destructive",
			});
			return;
		}

		const validateAddress: ValidateAddressI = await fetchValidateAddress(
			bitcoinAddress.address,
		);
		if (!validateAddress) {
			console.error("Not able to validate the address.");
			toast?.({
				title: "Address",
				description: "Unable to validate the Bitcoin address.",
				variant: "destructive",
			});
			return;
		}

		const estimatedFee = 1000;

		// Check if we have sufficient funds
		const totalAvailable = utxos[0].value;
		const totalRequired = sendAmountInSatoshi + estimatedFee;

		if (totalAvailable < totalRequired) {
			console.error("Insufficient funds for transaction and fee.");
			toast?.({
				title: "Insufficient Funds",
				description: `Need ${totalRequired} satoshis but only have ${totalAvailable} available.`,
				variant: "destructive",
			});
			return;
		}

		const psbt = new Psbt({ network });

		psbt.addInput({
			hash: utxos[0].txid,
			index: utxos[0].vout,
			witnessUtxo: {
				script: Buffer.from(validateAddress.scriptPubKey, "hex"),
				value: utxos[0].value,
			},
		});

		psbt.addOutput({
			address: depositAddress,
			value: sendAmountInSatoshi,
		});

		let opReturnData: Buffer;
		try {
			opReturnData = Buffer.from(opReturnInput, "hex");
		} catch (error) {
			console.error("Invalid OP_RETURN data:", error);
			toast?.({
				title: "Invalid Data",
				description: "Invalid OP_RETURN data format.",
				variant: "destructive",
			});
			return;
		}

		const opReturnScript = script.compile([opcodes.OP_RETURN, opReturnData]);
		psbt.addOutput({
			script: opReturnScript,
			value: 0,
		});

		const changeAmount = totalAvailable - sendAmountInSatoshi - estimatedFee;

		// Only add change output if change amount is significant (> dust threshold)
		const dustThreshold = 546; // Standard dust threshold in satoshis
		if (changeAmount > dustThreshold) {
			psbt.addOutput({
				address: bitcoinAddress.address,
				value: changeAmount,
			});
		}

		const txHex = psbt.toBase64();

		const response = await Wallet.request("signPsbt", {
			psbt: txHex,
			signInputs: {
				[bitcoinAddress.address]: [0],
			},
			broadcast: true,
		});

		if (response.status !== "success") {
			toast?.({
				title: "Transaction Failed",
				description: "Failed to broadcast the transaction.",
				variant: "destructive",
			});
			console.error("Transaction failed:", response);
		}
		return response;
	} catch (error) {
		console.error("nBTC Mint Transaction Error:", error);
		toast?.({
			title: "Transaction Error",
			description: error instanceof Error ? error.message : "An unexpected error occurred.",
			variant: "destructive",
		});
	}
}
