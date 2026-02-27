import { describe, test, expect, vi, beforeEach } from "vitest";
import { Transaction } from "@mysten/sui/transactions";
import { createRedeemTxn } from "./redeemTxn";
import type { NbtcCfg } from "~/config/sui/contracts-config";
import * as bitcoinClient from "~/lib/bitcoin.client";
import type { SuiClient } from "@mysten/sui/client";
import { getCoinsForAmount } from "~/lib/suiCoins";

// Mock dependencies
vi.mock("~/lib/bitcoin.client");
vi.mock("../BuyNBTC/useNBTC");
vi.mock("~/lib/getCoinsForAmount");

const mockClient = {
	getCoins: vi.fn(),
} as unknown as SuiClient;

const mockRedeemCfg: NbtcCfg = {
	pkgId: "0x123",
	coinType: "",
	contractId: "0x456",
	setupId: 0,
};

const mockCoinData = [
	{ coinObjectId: "0xcoin1", balance: "1000000000" },
	{ coinObjectId: "0xcoin2", balance: "500000000" },
];

describe("createRedeemBTCTxn", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should throw error when contractId or pkg is missing", async () => {
		let invalidCfg = { ...mockRedeemCfg, contractId: "" };

		await expect(
			createRedeemTxn(
				"0xsender",
				1000000000n,
				1n,
				new Uint8Array([72, 101, 108, 108, 111]),
				invalidCfg,
				mockClient,
				"0xnbtc",
			),
		).rejects.toThrow("Contract ID is not found");

		invalidCfg = { ...mockRedeemCfg, pkgId: "" };

		await expect(
			createRedeemTxn(
				"0xsender",
				1000000000n,
				1n,
				new Uint8Array([72, 101, 108, 108, 111]),
				invalidCfg,
				mockClient,
				"0xnbtc",
			),
		).rejects.toThrow("Redeem BTC package ID is not found");
	});

	test("should throw error when no nBTC coins available", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.scriptPubKeyFromAddress).mockResolvedValue(mockScriptBuffer);
		vi.mocked(getCoinsForAmount).mockResolvedValue({
			coins: [],
			fulfilled: false,
		});

		await expect(
			createRedeemTxn(
				"0xsender",
				1000000000n,
				1n,
				new Uint8Array([72, 101, 108, 108, 111]),
				mockRedeemCfg,
				mockClient,
				"0xnbtc",
			),
		).rejects.toThrow("Not enough nBTC coins available");
	});

	test("should create transaction with single coin", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.scriptPubKeyFromAddress).mockResolvedValue(mockScriptBuffer);
		vi.mocked(getCoinsForAmount).mockResolvedValue({
			coins: [mockCoinData[0]],
			fulfilled: true,
		});

		const result = await createRedeemTxn(
			"0xsender",
			1000000000n,
			1n,
			new Uint8Array([72, 101, 108, 108, 111]),
			mockRedeemCfg,
			mockClient,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		expect(getCoinsForAmount).toHaveBeenCalledWith(
			"0xsender",
			mockClient,
			"0xnbtc",
			1000000000n,
		);
	});

	test("should create transaction with multiple coins and merge them", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.scriptPubKeyFromAddress).mockResolvedValue(mockScriptBuffer);
		vi.mocked(getCoinsForAmount).mockResolvedValue({
			coins: mockCoinData,
			fulfilled: true,
		});

		const result = await createRedeemTxn(
			"0xsender",
			1000000000n,
			1n,
			new Uint8Array([72, 101, 108, 108, 111]),
			mockRedeemCfg,
			mockClient,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		expect(getCoinsForAmount).toHaveBeenCalledWith(
			"0xsender",
			mockClient,
			"0xnbtc",
			1000000000n,
		);
	});

	test("should handle mainnet or testnet bitcoin addresses", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.scriptPubKeyFromAddress).mockResolvedValue(mockScriptBuffer);
		vi.mocked(getCoinsForAmount).mockResolvedValue({
			coins: [mockCoinData[0]],
			fulfilled: true,
		});

		let result = await createRedeemTxn(
			"0xsender",
			1000000000n,
			1n,
			new Uint8Array([72, 101, 108, 108, 111]),
			mockRedeemCfg,
			mockClient,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		result = await createRedeemTxn(
			"0xsender",
			500000000n,
			1n,
			new Uint8Array([72, 101, 108, 108, 111]),
			mockRedeemCfg,
			mockClient,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
	});

	test("should handle different redemption amounts", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.scriptPubKeyFromAddress).mockResolvedValue(mockScriptBuffer);
		vi.mocked(getCoinsForAmount).mockResolvedValue({
			coins: [mockCoinData[0]],
			fulfilled: true,
		});

		const smallAmount = 100000n; // 0.001 BTC
		const result = await createRedeemTxn(
			"0xsender",
			smallAmount,
			1n,
			new Uint8Array([72, 101, 108, 108, 111]),
			mockRedeemCfg,
			mockClient,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		expect(getCoinsForAmount).toHaveBeenCalledWith(
			"0xsender",
			mockClient,
			"0xnbtc",
			smallAmount,
		);
	});
});
