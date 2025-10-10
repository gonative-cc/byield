function numToHex(n: number): string {
	return n.toString(16).padStart(2, "0");
}

/**
 * Converts a hex string to a Uint8Array.
 *
 * @throws {TypeError} If the input is not a string or has an odd length.
 * @throws {Error} If the string contains non-hex characters.
 */
export function hexToUint8Array(hexString: string): Uint8Array {
	// Remove the optional "0x" prefix
	const sanitizedHex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;

	if (sanitizedHex.length % 2 !== 0) {
		throw new TypeError("Hex string must have an even number of characters");
	}

	const result = new Uint8Array(sanitizedHex.length / 2);

	for (let i = 0; i < sanitizedHex.length; i += 2) {
		const hexByte = sanitizedHex.substring(i, i + 2);
		const byteValue = parseInt(hexByte, 16);

		if (isNaN(byteValue)) {
			throw new Error(`Invalid hex character found at position ${i}: "${hexByte}"`);
		}

		result[i / 2] = byteValue;
	}

	return result;
}

/**
 * Converts a Uint8Array to its hexadecimal string representation.
 * Each byte is converted to a two-digit hex value, padded with a leading '0' if necessary.
 * @param uint8Array The Uint8Array to convert.
 * @returns The hexadecimal string.
 */
export function uint8ArrayToHex(uint8Array: Uint8Array): string {
	return Array.from(uint8Array, numToHex).join("");
}
