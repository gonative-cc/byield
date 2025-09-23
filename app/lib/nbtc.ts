import Wallet, { BitcoinNetworkType } from "sats-connect";
import { type Address, type RpcResult } from "sats-connect";
import { fetchUTXOs, type UTXO } from "~/lib/external-apis";
import {
	getBitcoinNetworkConfig,
	createPsbt,
	compileScript,
	getOpReturnOpcode,
	getBitcoinLib,
} from "./bitcoin.client";
import { toast } from "~/hooks/use-toast";

export const PRICE_PER_NBTC_IN_SUI = 25000n;
const DUST_THRESHOLD_SATOSHI = 546;

// Enum for OP_RETURN flags
export enum OpReturnFlag {
	MINT = 0x00,
}

export async function nBTCMintTx(
	bitcoinAddress: Address,
	mintAmountInSatoshi: number,
	opReturn: string,
	bitcoinNetworkType: BitcoinNetworkType,
	depositAddress: string,
): Promise<RpcResult<"signPsbt"> | undefined> {
	try {
		const network = await getBitcoinNetworkConfig(bitcoinNetworkType);

		if (!network) {
			console.error("network config not found");
			toast?.({
				title: "Bitcoin network",
				description: "Bitcoin network not found",
				variant: "destructive",
			});
			return;
		}

		const utxos: UTXO[] = await fetchUTXOs(bitcoinAddress.address, bitcoinNetworkType);
		if (!utxos?.length) {
			console.error("utxos not found.");
			toast?.({
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
			const outputScript = bitcoinjs.address.toOutputScript(bitcoinAddress.address, network);
			validateAddress = {
				isValid: true,
				address: bitcoinAddress.address,
				scriptPubKey: outputScript.toString("hex"),
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
			toast?.({
				title: "Address",
				description: "Invalid Bitcoin address format.",
				variant: "destructive",
			});
			return;
		}

		// Use a fixed miner/network fee for the Bitcoin tx (not the displayed minting fee)
		const estimatedFee = 500;

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

		const psbt = await createPsbt(network);

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
			toast?.({
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

		const shouldBroadcast = true;

		const response = await Wallet.request("signPsbt", {
			psbt: txHex,
			signInputs: {
				[bitcoinAddress.address]: [0],
			},
			broadcast: shouldBroadcast,
		});

		if (!shouldBroadcast && response.status === "success") {
			toast?.({
				title: "Transaction Signed",
				description: "PSBT signed successfully. Broadcast manually if needed.",
				variant: "default",
			});
		}

		if (response.status !== "success") {
			toast?.({
				title: "Transaction Failed",
				description: "Failed to broadcast the transaction.",
				variant: "destructive",
			});
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
