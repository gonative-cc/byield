import { opcodes, Psbt, script } from "bitcoinjs-lib";
import Wallet from "sats-connect";
import { type Address, type RpcResult } from "sats-connect";
import { fetchUTXOs, fetchValidateAddress } from "~/api/btcrpc";
import type { UTXO, ValidateAddressI } from "~/api/btcrpc";
import { getBitcoinNetworkConfig } from "~/components/Wallet/XverseWallet/useWallet";
import { toast } from "~/hooks/use-toast";
import type { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";

export const PRICE_PER_NBTC_IN_SUI = 25000n;
const DUST_THRESHOLD_SATOSHI = 546;

export type OpReturnType = "hex" | "script" | "auto";

export interface OpReturnConfig {
	data: string;
	type?: OpReturnType;
}

export function createOpReturnScript(input: string | OpReturnConfig): Buffer {
	let data: string;
	let type: OpReturnType = "auto";

	if (typeof input === "string") {
		data = input;
	} else {
		data = input.data;
		type = input.type || "auto";
	}

	if (type === "auto") {
		type = detectOpReturnFormat(data);
	}

	switch (type) {
		case "hex":
			return createHexOpReturn(data);
		case "script":
			return createScriptOpReturn(data);
		default:
			throw new Error(`Unsupported OP_RETURN type: ${type}`);
	}
}

function detectOpReturnFormat(data: string): "hex" | "script" {
	const cleanData = data.trim();

	if (
		/\bOP_[A-Z0-9_]+\b/.test(cleanData) ||
		/\bPUSHDATA[1-4]?\b/.test(cleanData) ||
		/\bPUSH\b/.test(cleanData) ||
		cleanData.includes(" ")
	) {
		return "script";
	}

	if (
		/^(0x)?[0-9a-fA-F]+$/.test(cleanData) &&
		(cleanData.length % 2 === 0 ||
			(cleanData.startsWith("0x") && (cleanData.length - 2) % 2 === 0))
	) {
		return "hex";
	}

	return "hex";
}

function createHexOpReturn(hexData: string): Buffer {
	let cleanHex = hexData.trim();

	if (cleanHex.toLowerCase().startsWith("0x")) {
		cleanHex = cleanHex.substring(2);
	}

	if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
		throw new Error("Invalid hex format in OP_RETURN data");
	}

	if (cleanHex.length % 2 !== 0) {
		throw new Error("Hex data must have even length");
	}

	const opReturnData = Buffer.from(cleanHex, "hex");
	return script.compile([opcodes.OP_RETURN, opReturnData]);
}

function createScriptOpReturn(scriptInstructions: string): Buffer {
	try {
		const instructions = parseScriptInstructions(scriptInstructions);
		return script.compile([opcodes.OP_RETURN, ...instructions]);
	} catch (error) {
		throw new Error(
			`Failed to compile script instructions: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

function parseScriptInstructions(scriptInstructions: string): (number | Buffer)[] {
	const instructions: (number | Buffer)[] = [];
	const tokens = scriptInstructions.trim().split(/\s+/);

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];

		if (token.startsWith("OP_") && !token.startsWith("OP_PUSHBYTES_")) {
			const opcodeKey = token as keyof typeof opcodes;
			if (opcodes[opcodeKey] !== undefined) {
				instructions.push(opcodes[opcodeKey]);
			} else {
				throw new Error(`Unknown opcode: ${token}`);
			}
		} else if (token.startsWith("OP_PUSHBYTES_")) {
			const bytesStr = token.substring("OP_PUSHBYTES_".length);
			const bytes = parseInt(bytesStr, 10);
			if (bytes >= 1 && bytes <= 75) {
				instructions.push(bytes);
			} else {
				throw new Error(`Invalid OP_PUSHBYTES length: ${bytes}. Must be 1-75.`);
			}
		} else if (token.startsWith("PUSHDATA")) {
			const opcodeKey = ("OP_" + token) as keyof typeof opcodes;
			if (opcodes[opcodeKey] !== undefined) {
				instructions.push(opcodes[opcodeKey]);
			} else {
				throw new Error(`Unknown PUSHDATA opcode: ${token}`);
			}
		} else if (token === "PUSH") {
			if (i + 1 < tokens.length) {
				const nextToken = tokens[i + 1];
				if (nextToken.startsWith("0x") || /^[0-9a-fA-F]+$/.test(nextToken)) {
					const hexData = nextToken.startsWith("0x") ? nextToken.substring(2) : nextToken;

					if (hexData.length % 2 !== 0) {
						throw new Error(`Hex data must have even length: ${nextToken}`);
					}

					const buffer = Buffer.from(hexData, "hex");
					const dataLength = buffer.length;

					if (dataLength >= 1 && dataLength <= 75) {
						instructions.push(dataLength);
					} else if (dataLength <= 255) {
						instructions.push(opcodes.OP_PUSHDATA1);
						instructions.push(dataLength);
					} else if (dataLength <= 65535) {
						instructions.push(opcodes.OP_PUSHDATA2);
						instructions.push(dataLength & 0xff);
						instructions.push((dataLength >> 8) & 0xff);
					} else {
						throw new Error(`Data too large for Bitcoin script: ${dataLength} bytes`);
					}

					instructions.push(buffer);
					i++;
				} else {
					throw new Error(
						`PUSH instruction must be followed by hex data, got: ${nextToken}`,
					);
				}
			} else {
				throw new Error("PUSH instruction must be followed by data");
			}
		} else if (/^\d+$/.test(token)) {
			const opcode = parseInt(token, 10);
			if (opcode >= 0 && opcode <= 255) {
				instructions.push(opcode);

				if (opcode >= 1 && opcode <= 75 && i + 1 < tokens.length) {
					const nextToken = tokens[i + 1];
					if (nextToken.startsWith("0x") || /^[0-9a-fA-F]+$/.test(nextToken)) {
						const hexData = nextToken.startsWith("0x")
							? nextToken.substring(2)
							: nextToken;

						if (hexData.length % 2 !== 0) {
							throw new Error(`Hex data must have even length: ${nextToken}`);
						}

						const buffer = Buffer.from(hexData, "hex");
						if (buffer.length !== opcode) {
							throw new Error(
								`Data length (${buffer.length}) doesn't match push opcode (${opcode})`,
							);
						}

						instructions.push(buffer);
						i++;
					}
				}
			} else {
				throw new Error(`Invalid opcode value: ${opcode}. Must be 0-255.`);
			}
		} else if (token.startsWith("0x") || /^[0-9a-fA-F]+$/.test(token)) {
			const hexData = token.startsWith("0x") ? token.substring(2) : token;

			if (hexData.length % 2 !== 0) {
				throw new Error(`Hex data must have even length: ${token}`);
			}

			const buffer = Buffer.from(hexData, "hex");
			instructions.push(buffer);
		} else {
			throw new Error(`Unrecognized script token: ${token}`);
		}
	}

	return instructions;
}

export async function nBTCMintTx(
	bitcoinAddress: Address,
	mintAmountInSatoshi: number,
	opReturn: string | OpReturnConfig,
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

		let opReturnScript: Buffer;
		try {
			opReturnScript = createOpReturnScript(opReturn);
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
