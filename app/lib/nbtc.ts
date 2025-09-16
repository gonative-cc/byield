import { opcodes, Psbt, script } from "bitcoinjs-lib";
import Wallet from "sats-connect";
import { type Address, type RpcResult } from "sats-connect";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { fetchUTXOs, fetchValidateAddress } from "~/api/btcrpc";
import type { UTXO, ValidateAddressI } from "~/api/btcrpc";
import { getBitcoinNetworkConfig } from "~/components/Wallet/XverseWallet/useWallet";
import { toast } from "~/hooks/use-toast";
import type { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";

export const PRICE_PER_NBTC_IN_SUI = 25000n;
const DUST_THRESHOLD_SATOSHI = 546;

// OP_RETURN script action types
export const MINT_NBTC_ACTION = "0";
export const FUTURE_ACTION = "1";

export type OpReturnActionType = "0" | "1";

export function createOpReturnScript(actionType: OpReturnActionType, suiAddress: string): string {
	if (!actionType || (actionType !== MINT_NBTC_ACTION && actionType !== FUTURE_ACTION)) {
		throw new Error(
			`Invalid action type: ${actionType}. Must be '${MINT_NBTC_ACTION}' or '${FUTURE_ACTION}'`,
		);
	}

	if (!suiAddress) {
		throw new Error("SUI address is required");
	}

	if (!isValidSuiAddress(suiAddress)) {
		throw new Error(`Invalid SUI address: ${suiAddress}`);
	}

	const addressHex = suiAddress.startsWith("0x") ? suiAddress.substring(2) : suiAddress;

	if (addressHex.length !== 64) {
		throw new Error(
			`Invalid SUI address length: ${addressHex.length}. Expected 64 hex characters`,
		);
	}

	if (!/^[0-9a-fA-F]{64}$/.test(addressHex)) {
		throw new Error("SUI address contains invalid hex characters");
	}

	const actionTypeHex = actionType === MINT_NBTC_ACTION ? "00" : "01";

	return actionTypeHex + addressHex;
}

export async function nBTCMintTx(
	bitcoinAddress: Address,
	mintAmountInSatoshi: number,
	opReturn: string,
	bitcoinNetworkType: ExtendedBitcoinNetworkType,
	depositAddress: string,
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
			if (opReturn.length !== 66) {
				throw new Error(
					`OP_RETURN data must be exactly 66 hex characters (2 for action type + 64 for address), got ${opReturn.length}`,
				);
			}

			const actionTypeHex = opReturn.substring(0, 2);
			const suiAddressHex = opReturn.substring(2);

			if (actionTypeHex !== "00" && actionTypeHex !== "01") {
				throw new Error(
					`Invalid action type hex: ${actionTypeHex}. Must be '00' for mint or '01' for future actions`,
				);
			}

			if (suiAddressHex.length !== 64) {
				throw new Error(
					`Invalid SUI address length: ${suiAddressHex.length}. Expected 64 hex characters`,
				);
			}

			if (!/^[0-9a-fA-F]{64}$/.test(suiAddressHex)) {
				throw new Error("SUI address contains invalid hex characters");
			}

			const fullSuiAddress = `0x${suiAddressHex}`;
			if (!isValidSuiAddress(fullSuiAddress)) {
				throw new Error(`Invalid SUI address: ${fullSuiAddress}`);
			}

			opReturnData = Buffer.from(opReturn, "hex");
		} catch (error) {
			console.error("Invalid OP_RETURN data:", error);
			toast?.({
				title: "Invalid OP_RETURN Data",
				description:
					error instanceof Error ? error.message : "Invalid OP_RETURN data format.",
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
