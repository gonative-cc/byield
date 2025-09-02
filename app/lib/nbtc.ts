import { opcodes, Psbt, script } from "bitcoinjs-lib";
import Wallet from "sats-connect";
import { BitcoinNetworkType, type Address, type RpcResult } from "sats-connect";
import { fetchUTXOs, fetchValidateAddress } from "~/api/btcrpc";
import type { UTXO, ValidateAddressI } from "~/api/btcrpc";
import { getBitcoinNetworkConfig } from "~/components/Wallet/XverseWallet/useWallet";
import type { ToastFunction } from "~/hooks/use-toast";

export const PRICE_PER_NBTC_IN_SUI = 25000n;
export const NBTC_COIN_TYPE =
	"0x5419f6e223f18a9141e91a42286f2783eee27bf2667422c2100afc7b2296731b::nbtc::NBTC";
const DUST_THRESHOLD_SATOSHI = 546;

export async function nBTCMintTx(
	bitcoinAddress: Address,
	mintAmountInSatoshi: number,
	opReturn: string,
	bitcoinNetworkType: BitcoinNetworkType,
	depositAddress: string,
	toast?: ToastFunction,
): Promise<RpcResult<"signPsbt"> | undefined> {
	try {
		const network = getBitcoinNetworkConfig(bitcoinNetworkType);

		if (!network) {
			console.error("network config not found");
			toast?.({
				title: "Bitcoin network",
				description: "Bitcoin network not found",
				variant: "destructive",
			});
			return;
		}

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

		// TODO: dynamic fee calculation
		const estimatedFee = 1000;

		// Check if we have sufficient funds
		const totalAvailable = utxos[0].value;
		const totalRequired = mintAmountInSatoshi + estimatedFee;

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
			value: mintAmountInSatoshi,
		});

		let opReturnData: Buffer;
		try {
			opReturnData = Buffer.from(opReturn, "hex");
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

		const changeAmount = totalAvailable - mintAmountInSatoshi - estimatedFee;

		// Only add change output if change amount is significant (> dust threshold)
		const dustThreshold = DUST_THRESHOLD_SATOSHI; // Standard dust threshold in satoshis
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
