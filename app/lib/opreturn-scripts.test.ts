import { describe, test, expect } from "vitest";

const MINT_NBTC_ACTION = "0";
const FUTURE_ACTION = "1";

/**
 * Creates an OP_RETURN script string for Bitcoin transactions
 * Format: [action_type] [sui_address]
 *
 * @param actionType - '0' for mint nBTC action, '1' for future actions
 * @param suiAddress - Full SUI address with 0x prefix
 * @returns OP_RETURN script string (action type + space + full SUI address)
 */
function createOpReturnScript(
	actionType: typeof MINT_NBTC_ACTION | typeof FUTURE_ACTION,
	suiAddress: string,
): string {
	return `${actionType} ${suiAddress}`;
}

describe("OP_RETURN Script Functions", () => {
	describe("createOpReturnScript", () => {
		test("should create mint action script with 0x prefix", () => {
			const testAddress =
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const result = createOpReturnScript(MINT_NBTC_ACTION, testAddress);

			expect(result).toBe(
				"0 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			expect(result.length).toBe(68);
			expect(result.startsWith("0 0x")).toBe(true);
		});

		test("should create future action script with 0x prefix", () => {
			const testAddress =
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const result = createOpReturnScript(FUTURE_ACTION, testAddress);

			expect(result).toBe(
				"1 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			expect(result.length).toBe(68);
			expect(result.startsWith("1 0x")).toBe(true);
		});

		test("should create mint action script without 0x prefix", () => {
			const testAddress = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const result = createOpReturnScript(MINT_NBTC_ACTION, testAddress);

			expect(result).toBe(
				"0 1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			expect(result.length).toBe(66);
			expect(result.startsWith("0 ")).toBe(true);
		});

		test("should handle uppercase hex addresses", () => {
			const testAddress =
				"0x1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF";
			const result = createOpReturnScript(MINT_NBTC_ACTION, testAddress);

			expect(result).toBe(
				"0 0x1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF",
			);
			expect(result.startsWith("0 0x")).toBe(true);
		});

		test("should handle mixed case 0x prefix", () => {
			const testAddress =
				"0X1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const result = createOpReturnScript(MINT_NBTC_ACTION, testAddress);

			expect(result).toBe(
				"0 0X1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			expect(result.startsWith("0 0X")).toBe(true);
		});

		test("should handle short addresses", () => {
			const testAddress = "0x123";
			const result = createOpReturnScript(MINT_NBTC_ACTION, testAddress);

			expect(result).toBe("0 0x123");
			expect(result.startsWith("0 0x")).toBe(true);
		});
	});

	describe("Action Type Constants", () => {
		test("should have correct action type values", () => {
			expect(MINT_NBTC_ACTION).toBe("0");
			expect(FUTURE_ACTION).toBe("1");
		});
	});

	describe("OP_RETURN Script Format Validation", () => {
		test("should create valid format for parsing", () => {
			const testAddress =
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const script = createOpReturnScript(MINT_NBTC_ACTION, testAddress);

			const parts = script.split(" ");
			expect(parts.length).toBe(2);

			const actionType = parts[0];
			const suiAddress = parts[1];

			expect(actionType).toBe(MINT_NBTC_ACTION);
			expect(suiAddress).toBe(
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			expect(suiAddress.length).toBe(66);

			expect(suiAddress.startsWith("0x")).toBe(true);
			expect(/^0x[0-9a-fA-F]{64}$/.test(suiAddress)).toBe(true);
		});

		test("should parse script format correctly", () => {
			const mintScript = createOpReturnScript(
				MINT_NBTC_ACTION,
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			const futureScript = createOpReturnScript(
				FUTURE_ACTION,
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);

			const mintParts = mintScript.split(" ");
			expect(mintParts[0]).toBe(MINT_NBTC_ACTION);
			expect(mintParts[1]).toBe(
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);

			const futureParts = futureScript.split(" ");
			expect(futureParts[0]).toBe(FUTURE_ACTION);
			expect(futureParts[1]).toBe(
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
		});

		test("should validate parsing of different action types", () => {
			const testAddress =
				"0xabc123def456abc123def456abc123def456abc123def456abc123def456abc123";

			const mintScript = createOpReturnScript(MINT_NBTC_ACTION, testAddress);
			const mintParts = mintScript.split(" ");
			expect(mintParts.length).toBe(2);
			expect(mintParts[0]).toBe("0");
			expect(mintParts[1]).toBe(testAddress);

			const futureScript = createOpReturnScript(FUTURE_ACTION, testAddress);
			const futureParts = futureScript.split(" ");
			expect(futureParts.length).toBe(2);
			expect(futureParts[0]).toBe("1");
			expect(futureParts[1]).toBe(testAddress);
		});
	});
});
