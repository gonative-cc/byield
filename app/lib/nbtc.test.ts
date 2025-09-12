import { describe, it, expect } from "vitest";
import { opcodes, script } from "bitcoinjs-lib";

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

describe("OP_RETURN Script Support", () => {
	describe("createOpReturnScript", () => {
		describe("Hex data support (legacy)", () => {
			it("should create OP_RETURN script from hex string", () => {
				const hexData = "1234567890abcdef";
				const script = createOpReturnScript(hexData);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should handle hex string with 0x prefix", () => {
				const hexData = "0x1234567890abcdef";
				const script = createOpReturnScript(hexData);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should handle empty hex string", () => {
				const hexData = "";
				const script = createOpReturnScript(hexData);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should reject odd-length hex string", () => {
				const hexData = "123456789";

				expect(() => createOpReturnScript(hexData)).toThrow(
					"Hex data must have even length",
				);
			});

			it("should reject invalid hex characters", () => {
				const hexData = "12345xyz";

				expect(() => createOpReturnScript(hexData)).toThrow(
					"Invalid hex format in OP_RETURN data",
				);
			});
		});

		describe("Script instruction support", () => {
			it("should create OP_RETURN script from OP_PUSHBYTES instruction", () => {
				const scriptInstructions = "OP_PUSHBYTES_4 0x12345678";
				const script = createOpReturnScript(scriptInstructions);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
				expect(script[1]).toBe(4);
			});

			it("should handle PUSHDATA1 instruction", () => {
				const scriptInstructions = "OP_PUSHDATA1 0x04 0x12345678";
				const script = createOpReturnScript(scriptInstructions);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
				expect(script[1]).toBe(opcodes.OP_PUSHDATA1);
			});

			it("should handle PUSHDATA1 without OP_ prefix", () => {
				const scriptInstructions = "PUSHDATA1 0x04 0x12345678";
				const script = createOpReturnScript(scriptInstructions);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
				expect(script[1]).toBe(opcodes.OP_PUSHDATA1);
			});

			it("should handle PUSH instruction with auto-sizing", () => {
				const scriptInstructions = "PUSH 0x12345678";
				const script = createOpReturnScript(scriptInstructions);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
				expect(script[1]).toBe(4);
			});

			it("should handle multiple opcodes", () => {
				const scriptInstructions = "4 0x12345678 2 0xabcd";
				const script = createOpReturnScript(scriptInstructions);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
				expect(script[1]).toBe(4);
			});

			it("should handle numeric opcodes", () => {
				const scriptInstructions = "4 0x12345678";
				const script = createOpReturnScript(scriptInstructions);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
				expect(script[1]).toBe(4);
			});

			it("should reject unknown opcodes", () => {
				const scriptInstructions = "OP_UNKNOWN_OPCODE 0x1234";

				expect(() => createOpReturnScript(scriptInstructions)).toThrow(
					"Unknown opcode: OP_UNKNOWN_OPCODE",
				);
			});

			it("should reject invalid numeric opcodes", () => {
				const scriptInstructions = "256 0x1234";

				expect(() => createOpReturnScript(scriptInstructions)).toThrow(
					"Invalid opcode value: 256. Must be 0-255.",
				);
			});

			it("should reject odd-length hex data in script", () => {
				const scriptInstructions = "4 0x12345";

				expect(() => createOpReturnScript(scriptInstructions)).toThrow(
					"Hex data must have even length",
				);
			});

			it("should reject mismatched data length", () => {
				const scriptInstructions = "4 0x1234";

				expect(() => createOpReturnScript(scriptInstructions)).toThrow(
					"Data length (2) doesn't match push opcode (4)",
				);
			});

			it("should reject unrecognized tokens", () => {
				const scriptInstructions = "INVALID_TOKEN 0x1234";

				expect(() => createOpReturnScript(scriptInstructions)).toThrow(
					"Unrecognized script token: INVALID_TOKEN",
				);
			});
		});

		describe("OpReturnConfig object support", () => {
			it("should handle OpReturnConfig with hex type", () => {
				const config: OpReturnConfig = {
					data: "1234567890abcdef",
					type: "hex",
				};
				const script = createOpReturnScript(config);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should handle OpReturnConfig with script type", () => {
				const config: OpReturnConfig = {
					data: "4 0x12345678",
					type: "script",
				};
				const script = createOpReturnScript(config);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should handle OpReturnConfig with auto-detection", () => {
				const config: OpReturnConfig = {
					data: "1234567890abcdef",
					type: "auto",
				};
				const script = createOpReturnScript(config);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should default to auto-detection when type is omitted", () => {
				const config: OpReturnConfig = {
					data: "1234567890abcdef",
				};
				const script = createOpReturnScript(config);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});
		});

		describe("Auto-detection", () => {
			it("should auto-detect hex format", () => {
				const hexData = "1234567890abcdef";
				const script = createOpReturnScript(hexData);

				expect(script).toBeInstanceOf(Buffer);
				expect(script.length).toBeGreaterThan(2);
			});

			it("should auto-detect script format with OP_ opcodes", () => {
				const scriptData = "OP_PUSHBYTES_4 0x12345678";
				const script = createOpReturnScript(scriptData);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should auto-detect script format with PUSH", () => {
				const scriptData = "PUSH 0x12345678";
				const script = createOpReturnScript(scriptData);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should auto-detect script format with PUSHDATA", () => {
				const scriptData = "PUSHDATA1 0x04 0x12345678";
				const script = createOpReturnScript(scriptData);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should default to hex for ambiguous input", () => {
				const ambiguousData = "123";

				expect(() => createOpReturnScript(ambiguousData)).toThrow(
					"Hex data must have even length",
				);
			});
		});

		describe("Real-world examples", () => {
			it("should handle Bitcoin timestamp proof", () => {
				const script = createOpReturnScript(
					"4 0x64000000 32 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
				);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should handle simple text data", () => {
				const text = "Hello, Bitcoin!";
				const hexText = Buffer.from(text, "utf8").toString("hex");
				const script = createOpReturnScript(hexText);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should handle complex multi-push script", () => {
				const scriptInstructions = [
					"8 0x0123456789abcdef",
					"4 0x12345678",
					"OP_PUSHDATA1 0x02 0xabcd",
				].join(" ");

				const script = createOpReturnScript(scriptInstructions);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});
		});

		describe("Edge cases", () => {
			it("should handle whitespace in script instructions", () => {
				const scriptInstructions = "  4   0x12345678  ";
				const script = createOpReturnScript(scriptInstructions);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should handle uppercase and lowercase hex", () => {
				const hexData = "1234567890ABCDEF";
				const script = createOpReturnScript(hexData);

				expect(script).toBeInstanceOf(Buffer);
				expect(script[0]).toBe(opcodes.OP_RETURN);
			});

			it("should reject unsupported OP_RETURN type", () => {
				const config: OpReturnConfig = {
					data: "test",
					type: "unsupported" as OpReturnType,
				};

				expect(() => createOpReturnScript(config)).toThrow(
					"Unsupported OP_RETURN type: unsupported",
				);
			});
		});
	});
});
