import Wallet, { BitcoinNetworkType } from "sats-connect";
import { type Address, type RpcResult } from "sats-connect";
import { type UTXO } from "~/server/nbtc/types";
import {
	getBitcoinNetworkConfig,
	createPsbt,
	compileScript,
	getOpReturnOpcode,
	getBitcoinLib,
} from "./bitcoin.client";
import { toast } from "~/hooks/use-toast";
import type { BitcoinConfig } from "~/config/bitcoin/contracts-config";

export const PRICE_PER_NBTC_IN_SUI = 25000n;
const DUST_THRESHOLD_SATOSHI = 546;

// Enum for OP_RETURN flags
export enum OpReturnFlag {
	MINT = 0x00,
}

// TODO: this function is too long
/**
 * Constructs and signs a Bitcoin transaction for minting nBTC tokens.
 *
 * Bitcoin wallets only provide low-level `signPsbt()` APIs, requiring DApps to construct
 * complete PSBTs with custom OP_RETURN data. This follows standard Bitcoin DApp patterns.
 *
 * ## Transaction Structure:
 * - Input: User's UTXO (funding source)
 * - Output 1: nBTC deposit address (BTC amount)
 * - Output 2: OP_RETURN with Sui recipient address
 * - Output 3: Change back to user
 *
 * ## Change Handling:
 * If UTXO value > (mint amount + fees + dust threshold), remainder goes back to user.
 * Example: 1 BTC UTXO → mint 0.1 nBTC → 0.9 BTC change output created.
 *
 * ## OP_RETURN Format:
 * `[op_return type:(0x00)][Sui_Address(32 bytes)]`
 *
 * @param bitcoinAddress - User's Bitcoin wallet address
 * @param mintAmountInSatoshi - BTC amount to deposit (satoshis)
 * @param opReturn - Sui address for nBTC minting (0x... format)
 * @param network - Bitcoin network type
 * @param cfg - Bitcoin config (deposit address, fees)
 * @param utxos - User's available UTXOs (from queryUTXOs)
 * @returns Transaction response with txid if successful
 */
export async function nBTCMintTx(
	bitcoinAddress: Address,
	mintAmountInSatoshi: number,
	opReturn: string,
	network: BitcoinNetworkType,
	cfg: BitcoinConfig,
	utxos: UTXO[],
): Promise<RpcResult<"signPsbt"> | undefined> {
	const networkCfg = await getBitcoinNetworkConfig(network);
	if (!networkCfg) {
		const description = "can't fetch bitcoin network config for network: " + network;
		console.error(description);
		toast({
			title: "Bitcoin network",
			description,
			variant: "destructive",
		});
		return;
	}
	try {
		if (!utxos?.length) {
			console.error("utxos not found.");
			toast({
				title: "UTXO",
				description: "UTXOs not found for this address.",
				variant: "destructive",
			});
			return;
		}

		const bitcoinjs = await getBitcoinLib();
		let validateAddress: {
			isValid: boolean;
			address: string;
			scriptPubKey: string;
			isScript: boolean;
			isWitness: boolean;
			witnessVersion: number;
			witnessProgram: string;
		};
		try {
			const outputScript = bitcoinjs.address.toOutputScript(
				bitcoinAddress.address,
				networkCfg,
			);
			validateAddress = {
				isValid: true,
				address: bitcoinAddress.address,
				scriptPubKey: Buffer.from(outputScript).toString("hex"),
				isScript: false,
				isWitness:
					bitcoinAddress.address.startsWith("bc1") ||
					bitcoinAddress.address.startsWith("tb1") ||
					bitcoinAddress.address.startsWith("bcrt1"),
				witnessVersion: 0,
				witnessProgram: "",
			};
		} catch (error) {
			console.error("Invalid Bitcoin address:", error);
			toast({
				title: "Address",
				description: "Invalid Bitcoin address format.",
				variant: "destructive",
			});
			return;
		}

		// TODO: handle case when miner fee is zero - user should be able to change it,
		// so it should be an input to the function, and we should use the value from cfg as a fallback.
		const estimatedFee = cfg.minerFeeSats || 0;

		// Check if we have sufficient funds
		const totalAvailable = utxos[0].value;
		const totalRequired = mintAmountInSatoshi + estimatedFee;

		if (totalAvailable < totalRequired) {
			console.error("Insufficient funds for transaction and fee.");
			toast({
				title: "Insufficient Funds",
				description: `Need ${totalRequired} satoshis but only have ${totalAvailable} available.`,
				variant: "destructive",
			});
			return;
		}

		const psbt = await createPsbt(networkCfg);
		psbt.addInput({
			hash: utxos[0].txid,
			index: utxos[0].vout,
			witnessUtxo: {
				script: Buffer.from(validateAddress.scriptPubKey, "hex"),
				value: BigInt(utxos[0].value),
			},
		});

		psbt.addOutput({
			address: cfg.nBTC.depositAddress,
			value: BigInt(mintAmountInSatoshi),
		});

		let opReturnData: Buffer;
		try {
			if (!opReturn.startsWith("0x") || opReturn.length !== 66) {
				throw new Error(
					`Sui address must be in format 0x... with 64 hex chars, got ${opReturn}`,
				);
			}
			const cleanHex = opReturn.replace(/^0x/, "").toLowerCase();
			const flagByte = Buffer.from([OpReturnFlag.MINT]);
			const addressBytes = Buffer.from(cleanHex, "hex");
			opReturnData = Buffer.concat([flagByte, addressBytes]);
		} catch (error) {
			console.error("Invalid OP_RETURN data:", error);
			toast({
				title: "Invalid Data",
				description:
					error instanceof Error ? error.message : "Invalid OP_RETURN data format.",
				variant: "destructive",
			});
			return;
		}

		const OP_RETURN = await getOpReturnOpcode();
		const opReturnScript = await compileScript([OP_RETURN, opReturnData]);

		psbt.addOutput({
			script: opReturnScript,
			value: 0n,
		});

		const changeAmount = totalAvailable - mintAmountInSatoshi - estimatedFee;

		// Only add change output if change amount is significant (> dust threshold)
		const dustThreshold = DUST_THRESHOLD_SATOSHI; // Standard dust threshold in satoshis
		if (changeAmount > dustThreshold) {
			psbt.addOutput({
				address: bitcoinAddress.address,
				value: BigInt(changeAmount),
			});
		}

		const shouldBroadcast = true;
		const response = await Wallet.request("signPsbt", {
			psbt: psbt.toBase64(),
			signInputs: {
				[bitcoinAddress.address]: [0],
			},
			broadcast: shouldBroadcast,
		});

		if (!shouldBroadcast && response.status === "success") {
			toast({
				title: "Transaction Signed",
				description: "PSBT signed successfully. Broadcast manually if needed.",
				variant: "default",
			});
		}

		if (response.status !== "success") {
			toast({
				title: "Transaction Failed",
				description: "Failed to broadcast the transaction.",
				variant: "destructive",
			});
		}
		return response;
	} catch (error) {
		console.error("nBTC Mint Transaction Error:", error);
		toast({
			title: "Transaction Error",
			description: error instanceof Error ? error.message : "An unexpected error occurred.",
			variant: "destructive",
		});
	}
}
