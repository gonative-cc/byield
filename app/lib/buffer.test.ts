import { test, describe, expect } from "vitest";
import { uint8ArrayToHex, hexToUint8Array } from "./buffer";

describe("uint8ArrayToHex", () => {
	test("converts empty array to empty string", () => {
		const result = uint8ArrayToHex(new Uint8Array([]));
		expect(result).toBe("");
	});

	test("converts single byte correctly", () => {
		const result = uint8ArrayToHex(new Uint8Array([0]));
		expect(result).toBe("00");
	});

	test("converts single byte with maximum value correctly", () => {
		const result = uint8ArrayToHex(new Uint8Array([255]));
		expect(result).toBe("ff");
	});

	describe("handles multiple bytes", () => {
		test("converts multiple bytes correctly", () => {
			const result = uint8ArrayToHex(new Uint8Array([0, 1, 255, 16, 17]));
			expect(result).toBe("0001ff1011");
		});

		test("handles bytes requiring padding correctly", () => {
			const result = uint8ArrayToHex(new Uint8Array([1, 15, 16, 17, 31]));
			expect(result).toBe("010f10111f");
		});
	});

	test("handles all values from 0 to 255", () => {
		const allBytes = new Uint8Array(256);
		for (let i = 0; i < 256; i++) {
			allBytes[i] = i;
		}

		const result = uint8ArrayToHex(allBytes);

		// Check that the result string has the correct length (256 * 2 = 512 characters)
		expect(result.length).toBe(512);

		// Check specific values at their correct positions
		// Each byte produces 2 hex chars, so byte at index i is at position i*2 to i*2+1 in the result
		expect(result.substring(0, 2)).toBe("00"); // 0
		expect(result.substring(2, 4)).toBe("01"); // 1
		expect(result.substring(30, 32)).toBe("0f"); // 15
		expect(result.substring(32, 34)).toBe("10"); // 16
		expect(result.substring(34, 36)).toBe("11"); // 17
		expect(result.substring(62, 64)).toBe("1f"); // 31
		expect(result.substring(510, 512)).toBe("ff"); // 255 (last value at index 255 -> position 255*2=510 to 511)
	});
});

describe("hexToUint8Array", () => {
	test("converts empty string to empty array", () => {
		const result = hexToUint8Array("");
		expect(result).toEqual(new Uint8Array([]));
	});

	test("converts single byte correctly", () => {
		const result = hexToUint8Array("00");
		expect(result).toEqual(new Uint8Array([0]));
	});

	test("converts single byte with maximum value correctly", () => {
		const result = hexToUint8Array("ff");
		expect(result).toEqual(new Uint8Array([255]));
	});

	describe("handles multiple bytes", () => {
		test("converts multiple bytes correctly", () => {
			const result = hexToUint8Array("0001ff1011");
			expect(result).toEqual(new Uint8Array([0, 1, 255, 16, 17]));
		});

		test("handles bytes requiring padding correctly", () => {
			const result = hexToUint8Array("010f10111f");
			expect(result).toEqual(new Uint8Array([1, 15, 16, 17, 31]));
		});
	});

	test("handles all values from 0 to 255", () => {
		// Create the hex string for all values 0-255
		const hexValues = [];
		for (let i = 0; i < 256; i++) {
			hexValues.push(i.toString(16).padStart(2, "0"));
		}
		const hexString = hexValues.join("");

		const result = hexToUint8Array(hexString);

		// Check that the result array has the correct length (256 elements)
		expect(result.length).toBe(256);

		// Check specific values
		expect(result[0]).toBe(0); // First value
		expect(result[1]).toBe(1); // Second value
		expect(result[15]).toBe(15); // 16th value
		expect(result[16]).toBe(16); // 17th value
		expect(result[17]).toBe(17); // 18th value
		expect(result[31]).toBe(31); // 32nd value
		expect(result[255]).toBe(255); // Last value
	});

	test("throws error for odd-length hex string", () => {
		expect(() => hexToUint8Array("f")).toThrow(
			"Hex string must have an even number of characters",
		);
		expect(() => hexToUint8Array("abc")).toThrow(
			"Hex string must have an even number of characters",
		);
	});

	test("throws error for non-hex characters", () => {
		expect(() => hexToUint8Array("fg")).toThrow("Hex string contains non-hex characters");
		// Test an even-length string with non-hex characters
		expect(() => hexToUint8Array("xy")).toThrow("Hex string contains non-hex characters");
		expect(() => hexToUint8Array("12g3")).toThrow("Hex string contains non-hex characters");
	});

	test("ignores spaces in hex string", () => {
		const result = hexToUint8Array("00 01 ff 10 11");
		expect(result).toEqual(new Uint8Array([0, 1, 255, 16, 17]));
	});

	test("handles mixed case hex string", () => {
		const result = hexToUint8Array("AaBbCcDd");
		expect(result).toEqual(new Uint8Array([170, 187, 204, 221])); // 0xAa=170, 0xBb=187, 0xCc=204, 0xDd=221
	});
});
