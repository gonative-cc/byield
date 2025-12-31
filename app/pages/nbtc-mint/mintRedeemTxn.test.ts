import { describe, test, expect, vi, beforeEach } from "vitest";
import { Transaction } from "@mysten/sui/transactions";
import { BitcoinNetworkType } from "sats-connect";
import { createRedeemTxn } from "./mintRedeemTxn";
import type { RedeemCfg } from "~/config/sui/contracts-config";
import * as bitcoinClient from "~/lib/bitcoin.client";
import * as useNBTC from "../BuyNBTC/useNBTC";
import type { SuiClient } from "@mysten/sui/client";

// Mock dependencies
vi.mock("~/lib/bitcoin.client");
vi.mock("../BuyNBTC/useNBTC");

const mockClient = {
	getCoins: vi.fn(),
} as unknown as SuiClient;

const mockRedeemCfg: RedeemCfg = {
	pkgId: "0x123",
	contractId: "0x456",
	module: "nbtc",
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

	test("should throw error when contractId is missing", async () => {
		const invalidCfg = { ...mockRedeemCfg, contractId: "" };

		await expect(
			createRedeemTxn(
				"0xsender",
				1000000000n,
				"bcrt1qseh0z29yzveh02snqn6ztg956puernf36rgh4z",
				invalidCfg,
				mockClient,
				BitcoinNetworkType.Regtest,
				"0xnbtc",
			),
		).rejects.toThrow("Contract ID is not found");
	});

	test("should throw error when pkgId is missing", async () => {
		const invalidCfg = { ...mockRedeemCfg, pkgId: "" };

		await expect(
			createRedeemTxn(
				"0xsender",
				1000000000n,
				"bcrt1qseh0z29yzveh02snqn6ztg956puernf36rgh4z",
				invalidCfg,
				mockClient,
				BitcoinNetworkType.Regtest,
				"0xnbtc",
			),
		).rejects.toThrow("Redeem BTC package ID is not found");
	});

	test("should throw error for invalid recipient address", async () => {
		vi.mocked(bitcoinClient.getBtcAddrOutputScript).mockResolvedValue(null);

		await expect(
			createRedeemTxn(
				"0xsender",
				1000000000n,
				"invalid-address",
				mockRedeemCfg,
				mockClient,
				BitcoinNetworkType.Regtest,
				"0xnbtc",
			),
		).rejects.toThrow("Invalid recipient address");
	});

	test("should throw error when no nBTC coins available", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.getBtcAddrOutputScript).mockResolvedValue(mockScriptBuffer);
		vi.mocked(useNBTC.getEnoughNbtcCoinsWithAmount).mockResolvedValue({
			nbtcCoins: [],
			isEnoughBalance: false,
		});

		await expect(
			createRedeemTxn(
				"0xsender",
				1000000000n,
				"bcrt1qseh0z29yzveh02snqn6ztg956puernf36rgh4z",
				mockRedeemCfg,
				mockClient,
				BitcoinNetworkType.Regtest,
				"0xnbtc",
			),
		).rejects.toThrow("Not enough nBTC coins available");
	});

	test("should create transaction with single coin", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.getBtcAddrOutputScript).mockResolvedValue(mockScriptBuffer);
		vi.mocked(useNBTC.getEnoughNbtcCoinsWithAmount).mockResolvedValue({
			nbtcCoins: [mockCoinData[0]],
			isEnoughBalance: true,
		});

		const result = await createRedeemTxn(
			"0xsender",
			1000000000n,
			"bcrt1qseh0z29yzveh02snqn6ztg956puernf36rgh4z",
			mockRedeemCfg,
			mockClient,
			BitcoinNetworkType.Regtest,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		expect(bitcoinClient.getBtcAddrOutputScript).toHaveBeenCalledWith(
			"bcrt1qseh0z29yzveh02snqn6ztg956puernf36rgh4z",
			BitcoinNetworkType.Regtest,
		);
		expect(useNBTC.getEnoughNbtcCoinsWithAmount).toHaveBeenCalledWith(
			"0xsender",
			mockClient,
			"0xnbtc",
			1000000000n,
		);
	});

	test("should create transaction with multiple coins and merge them", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.getBtcAddrOutputScript).mockResolvedValue(mockScriptBuffer);
		vi.mocked(useNBTC.getEnoughNbtcCoinsWithAmount).mockResolvedValue({
			nbtcCoins: mockCoinData,
			isEnoughBalance: true,
		});

		const result = await createRedeemTxn(
			"0xsender",
			1000000000n,
			"bcrt1qseh0z29yzveh02snqn6ztg956puernf36rgh4z",
			mockRedeemCfg,
			mockClient,
			BitcoinNetworkType.Regtest,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		expect(useNBTC.getEnoughNbtcCoinsWithAmount).toHaveBeenCalledWith(
			"0xsender",
			mockClient,
			"0xnbtc",
			1000000000n,
		);
	});

	test("should handle mainnet bitcoin addresses", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.getBtcAddrOutputScript).mockResolvedValue(mockScriptBuffer);
		vi.mocked(useNBTC.getEnoughNbtcCoinsWithAmount).mockResolvedValue({
			nbtcCoins: [mockCoinData[0]],
			isEnoughBalance: true,
		});

		const result = await createRedeemTxn(
			"0xsender",
			1000000000n,
			"bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
			mockRedeemCfg,
			mockClient,
			BitcoinNetworkType.Mainnet,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		expect(bitcoinClient.getBtcAddrOutputScript).toHaveBeenCalledWith(
			"bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
			BitcoinNetworkType.Mainnet,
		);
	});

	test("should handle testnet bitcoin addresses", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.getBtcAddrOutputScript).mockResolvedValue(mockScriptBuffer);
		vi.mocked(useNBTC.getEnoughNbtcCoinsWithAmount).mockResolvedValue({
			nbtcCoins: [mockCoinData[0]],
			isEnoughBalance: true,
		});

		const result = await createRedeemTxn(
			"0xsender",
			500000000n,
			"tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
			mockRedeemCfg,
			mockClient,
			BitcoinNetworkType.Testnet,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		expect(bitcoinClient.getBtcAddrOutputScript).toHaveBeenCalledWith(
			"tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
			BitcoinNetworkType.Testnet,
		);
	});

	test("should handle different redemption amounts", async () => {
		const mockScriptBuffer = new Uint8Array([0x76, 0xa9, 0x14]);
		vi.mocked(bitcoinClient.getBtcAddrOutputScript).mockResolvedValue(mockScriptBuffer);
		vi.mocked(useNBTC.getEnoughNbtcCoinsWithAmount).mockResolvedValue({
			nbtcCoins: [mockCoinData[0]],
			isEnoughBalance: true,
		});

		const smallAmount = 100000n; // 0.001 BTC
		const result = await createRedeemTxn(
			"0xsender",
			smallAmount,
			"bcrt1qseh0z29yzveh02snqn6ztg956puernf36rgh4z",
			mockRedeemCfg,
			mockClient,
			BitcoinNetworkType.Regtest,
			"0xnbtc",
		);

		expect(result).toBeInstanceOf(Transaction);
		expect(useNBTC.getEnoughNbtcCoinsWithAmount).toHaveBeenCalledWith(
			"0xsender",
			mockClient,
			"0xnbtc",
			smallAmount,
		);
	});
});
