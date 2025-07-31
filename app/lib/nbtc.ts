import { networks, opcodes, Psbt, script, type Network } from "bitcoinjs-lib";
import Wallet from "sats-connect";
import type { Address } from "sats-connect";
import { fetchUTXOs, fetchValidateAddress } from "~/api/btcrpc";
import type { UTXO, ValidateAddressI } from "~/api/btcrpc";
import type { ToastFunction } from "~/hooks/use-toast";
import mintTestNetConfig from "~/config/mint/contracts-testnet.json";
import mintMainNetConfig from "~/config/mint/contracts-mainnet.json";

export const PRICE_PER_NBTC_IN_SUI = 25000n;
export const NBTC_COIN_TYPE =
	"0x5419f6e223f18a9141e91a42286f2783eee27bf2667422c2100afc7b2296731b::nbtc::NBTC";

// TODO: This needs node pollyfill. Find workaround for this.
export async function nBTCMintTxn(
	bitcoinAddress: Address,
	sendAmountInSatoshi: number,
	opReturnInput: string,
	network: Network,
	toast?: ToastFunction,
) {
	try {
		const depositAddress = networks.bitcoin
			? mintMainNetConfig.mint.depositAddress
			: mintTestNetConfig.mint.depositAddress;
		// fetch utxos
		const utxos: UTXO[] = await fetchUTXOs(bitcoinAddress.address);
		if (!utxos?.length) {
			console.error("utxos not found.");
			toast?.({
				title: "UTXO",
				description: "UTXOs not found for this address.",
				variant: "destructive",
			});
			return; // Early return to prevent further execution
		}

		// validate address
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
			return; // Early return to prevent further execution
		}

		// Estimate transaction fee (typical fee for a 2-input, 3-output transaction)
		const estimatedFee = 1000; // 1000 satoshis as a reasonable fee

		// Check if we have sufficient funds
		const totalAvailable = utxos[0].value;
		const totalRequired = sendAmountInSatoshi + estimatedFee;

		console.log("mum", totalAvailable, totalRequired);

		if (totalAvailable < totalRequired) {
			console.error("Insufficient funds for transaction and fee.");
			toast?.({
				title: "Insufficient Funds",
				description: `Need ${totalRequired} satoshis but only have ${totalAvailable} available.`,
				variant: "destructive",
			});
			return; // Early return to prevent further execution
		}

		const psbt = new Psbt({ network });

		// Add input
		psbt.addInput({
			hash: utxos[0].txid,
			index: utxos[0].vout,
			witnessUtxo: {
				script: Buffer.from(validateAddress.scriptPubKey, "hex"),
				value: utxos[0].value,
			},
		});

		// Add output to nBTC address
		psbt.addOutput({
			// TODO: replace hardcoded P2WPKH address for nBTC deposits
			address: depositAddress,
			value: sendAmountInSatoshi,
		});

		// Add OP_RETURN output (validate opReturnInput is valid hex or convert from string)
		let opReturnData: Buffer;
		try {
			// Try to parse as hex first, if it fails, treat as UTF-8 string
			opReturnData = opReturnInput.match(/^[0-9a-fA-F]+$/)
				? Buffer.from(opReturnInput, "hex")
				: Buffer.from(opReturnInput, "utf8");
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

		// Calculate change amount
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

		if (response.status === "success") {
			toast?.({
				title: "Transaction Sent",
				description: "Bitcoin transaction has been broadcast successfully.",
				variant: "default",
			});
			console.log("Transaction successful:", response);
		} else {
			toast?.({
				title: "Transaction Failed",
				description: "Failed to broadcast the transaction.",
				variant: "destructive",
			});
			console.error("Transaction failed:", response);
		}
	} catch (error) {
		console.error("nBTC Mint Transaction Error:", error);
		toast?.({
			title: "Transaction Error",
			description: error instanceof Error ? error.message : "An unexpected error occurred.",
			variant: "destructive",
		});
	}
}
