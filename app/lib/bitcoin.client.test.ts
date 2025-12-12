import { describe, test, expect } from "vitest";
import { isValidBitcoinAddress } from "./bitcoin.client";
import { BitcoinNetworkType } from "sats-connect";

describe("isValidBitcoinAddress", () => {
	test("should return false on invalid address", async () => {
		expect(await isValidBitcoinAddress("invalid", BitcoinNetworkType.Regtest)).toBe(false);
	});

	test("should return true on valid address", async () => {
		expect(
			await isValidBitcoinAddress(
				"bcrt1qseh0z29yzveh02snqn6ztg956puernf36rgh4z",
				BitcoinNetworkType.Regtest,
			),
		).toBe(true);
	});
});
