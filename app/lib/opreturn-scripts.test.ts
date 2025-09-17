import { describe, test, expect } from "vitest";
import {
	createOpReturnScript,
	MINT_NBTC_ACTION,
	FUTURE_ACTION,
	type OpReturnActionType,
} from "./nbtc";

describe("createOpReturnScript", () => {
	const validSuiAddress = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
	const validSuiAddressWithoutPrefix =
		"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

	describe("successful cases", () => {
		test("creates mint action payload with correct hex encoding", () => {
			const result = createOpReturnScript(MINT_NBTC_ACTION, validSuiAddress);

			expect(result).toBe(
				"001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			expect(result.length).toBe(66);

			expect(() => Buffer.from(result, "hex")).not.toThrow();
			const buffer = Buffer.from(result, "hex");
			expect(buffer.length).toBe(33);
		});

		test("creates future action payload with correct hex encoding", () => {
			const result = createOpReturnScript(FUTURE_ACTION, validSuiAddress);

			expect(result).toBe(
				"011234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			expect(result.length).toBe(66);

			const buffer = Buffer.from(result, "hex");
			expect(buffer.length).toBe(33);
		});

		test("handles SUI address without 0x prefix correctly", () => {
			const result = createOpReturnScript(MINT_NBTC_ACTION, validSuiAddressWithoutPrefix);

			expect(result).toBe(
				"001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			);
			expect(result.length).toBe(66);
		});

		test("produces consistent results for same inputs", () => {
			const result1 = createOpReturnScript(MINT_NBTC_ACTION, validSuiAddress);
			const result2 = createOpReturnScript(MINT_NBTC_ACTION, validSuiAddress);

			expect(result1).toBe(result2);
		});
	});

	describe("input validation", () => {
		test("throws error for invalid action type", () => {
			expect(() => createOpReturnScript("2" as OpReturnActionType, validSuiAddress)).toThrow(
				"Invalid action type: 2",
			);
		});

		test("throws error for empty action type", () => {
			expect(() => createOpReturnScript("" as OpReturnActionType, validSuiAddress)).toThrow(
				"Invalid action type:",
			);
		});

		test("throws error for missing SUI address", () => {
			expect(() => createOpReturnScript(MINT_NBTC_ACTION, "")).toThrow(
				"SUI address is required",
			);
		});

		test("throws error for invalid SUI address format", () => {
			const invalidAddress = "0xinvalid";
			expect(() => createOpReturnScript(MINT_NBTC_ACTION, invalidAddress)).toThrow(
				"Invalid SUI address:",
			);
		});

		test("throws error for SUI address with invalid length", () => {
			const shortAddress = "0x1234567890abcdef";
			expect(() => createOpReturnScript(MINT_NBTC_ACTION, shortAddress)).toThrow(
				"Invalid SUI address:",
			);
		});

		test("throws error for SUI address with non-hex characters", () => {
			const invalidHexAddress =
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcxyz";
			expect(() => createOpReturnScript(MINT_NBTC_ACTION, invalidHexAddress)).toThrow(
				"Invalid SUI address:",
			);
		});
	});

	describe("edge cases", () => {
		test("handles uppercase hex characters in SUI address", () => {
			const upperCaseAddress =
				"0x1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF";

			const result = createOpReturnScript(MINT_NBTC_ACTION, upperCaseAddress);
			expect(result).toBe(
				"001234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF",
			);
		});

		test("handles mixed case hex characters in SUI address", () => {
			const mixedCaseAddress =
				"0x1234567890aBcDeF1234567890aBcDeF1234567890aBcDeF1234567890aBcDeF";

			const result = createOpReturnScript(MINT_NBTC_ACTION, mixedCaseAddress);
			expect(result).toBe(
				"001234567890aBcDeF1234567890aBcDeF1234567890aBcDeF1234567890aBcDeF",
			);
		});
	});

	describe("integration with actual usage", () => {
		test("output can be parsed by nBTCMintTx validation logic", () => {
			const result = createOpReturnScript(MINT_NBTC_ACTION, validSuiAddress);

			expect(result.length).toBe(66);

			const actionTypeHex = result.substring(0, 2);
			const suiAddressHex = result.substring(2);

			expect(actionTypeHex).toBe("00");
			expect(suiAddressHex.length).toBe(64);
			expect(/^[0-9a-fA-F]{64}$/.test(suiAddressHex)).toBe(true);
		});

		test("future action output can be parsed correctly", () => {
			const result = createOpReturnScript(FUTURE_ACTION, validSuiAddress);

			const actionTypeHex = result.substring(0, 2);
			const suiAddressHex = result.substring(2);

			expect(actionTypeHex).toBe("01");
			expect(suiAddressHex.length).toBe(64);
		});
	});
});
