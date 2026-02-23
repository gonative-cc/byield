import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import Controller from "./controller.server";
import { MintTxStatus, type NbtcTxResp } from "@gonative-cc/btcindexer/models";
import { BitcoinNetworkType } from "sats-connect";
import type { SuiIndexerRpc } from "@gonative-cc/sui-indexer/rpc-interface";
import type { BtcIndexerRpc } from "@gonative-cc/btcindexer/rpc-interface";
import { BtcNet } from "@gonative-cc/lib/nbtc";
import { Miniflare } from "miniflare";

vi.mock("workers/constants", () => ({
	RECOMMENDED_FEE_KEY: "recommendedFee",
}));

// Mock the useBitcoinConfig module
vi.mock("~/hooks/useBitcoinConfig", () => ({
	mustGetBitcoinConfig: vi.fn(() => ({
		btcRPCUrl: "http://test-rpc-url",
		confirmationDepth: 6,
		blockTimeSec: 600,
		bitcoinBroadcastLink: "http://test-broadcast",
		mempoolApiUrl: "http://test-mempool",
		indexerUrl: "http://test-indexer",
		nBTC: {
			depositAddress: "test-deposit-address",
			mintingFee: 1000,
		},
	})),
}));

const mockIndexer: BtcIndexerRpc = {
	latestHeight: vi.fn(),
	putNbtcTx: vi.fn(),
	broadcastRedeemTx: vi.fn(),
	nbtcMintTx: vi.fn(),
	nbtcMintTxsBySuiAddr: vi.fn(),
	depositsBySender: vi.fn(),
};

const mockSuiIndexer: SuiIndexerRpc = {
	finalizeRedeems: vi.fn(),
	putRedeemTx: vi.fn(),
	getBroadcastedRedeemTxIds: vi.fn(),
	confirmRedeem: vi.fn(),
	redeemsBySuiAddr: vi.fn(),
	getConfirmingRedeems: vi.fn(),
	updateRedeemStatus: vi.fn(),
	updateRedeemStatuses: vi.fn(),
};

const mockNbtcTxResp: NbtcTxResp = {
	btcTxId: "abc123",
	amount: 100000,
	status: MintTxStatus.Confirming,
	sui_recipient: "0x123",
	sui_tx_id: "sui123",
	created_at: 1764243033,
	confirmations: 6,
	vout: 1,
	block_hash: null,
	block_height: null,
	updated_at: 1764243033,
	retry_count: 2,
	nbtc_pkg: "0x54321",
	sui_network: "testnet",
	btc_network: BtcNet.REGTEST,
};

describe("Controller getMintTxs", () => {
	let worker: Miniflare;
	let controller: Controller;

	beforeAll(async () => {
		worker = new Miniflare({
			modules: true,
			script: "",
			kvNamespaces: ["KV"],
			d1Databases: ["DB"],
			kvPersist: false,
			d1Persist: false,
			cachePersist: false,
		});
		await worker.ready;
	});

	afterAll(async () => {
		worker.dispose();
	});

	beforeEach(async () => {
		vi.clearAllMocks();
		const db = await worker.getD1Database("DB");
		controller = new Controller(BitcoinNetworkType.Testnet, mockIndexer, mockSuiIndexer, db);
	});

	it("should return badRequest when both addresses are null", async () => {
		const result = await controller["getMintTxs"](null, null);

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(400);
	});

	it("should fetch by SUI address when valid", async () => {
		const suiAddr = "0x0dfeef16c6730d27c1b53ba3b96c75831c2fbc66882b3ff136513bbdce9c60ea";
		vi.mocked(mockIndexer.nbtcMintTxsBySuiAddr).mockResolvedValue([mockNbtcTxResp]);

		const result = await controller["getMintTxs"](null, suiAddr);

		expect(mockIndexer.nbtcMintTxsBySuiAddr).toHaveBeenCalledWith(suiAddr);
		expect(Array.isArray(result)).toBe(true);
	});

	it("should fetch by BTC address when provided", async () => {
		const btcAddr = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
		vi.mocked(mockIndexer.depositsBySender).mockResolvedValue([mockNbtcTxResp]);

		const result = await controller["getMintTxs"](btcAddr, null);

		expect(mockIndexer.depositsBySender).toHaveBeenCalledWith(btcAddr, 1);
		expect(Array.isArray(result)).toBe(true);
	});

	it("should fetch from both sources when both addresses provided", async () => {
		const btcAddr = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
		const suiAddr = "0x0dfeef16c6730d27c1b53ba3b96c75831c2fbc66882b3ff136513bbdce9c60ea";

		vi.mocked(mockIndexer.nbtcMintTxsBySuiAddr).mockResolvedValue([mockNbtcTxResp]);
		vi.mocked(mockIndexer.depositsBySender).mockResolvedValue([mockNbtcTxResp]);

		const result = await controller["getMintTxs"](btcAddr, suiAddr);

		expect(mockIndexer.depositsBySender).toHaveBeenCalledWith(btcAddr, 1);
		expect(mockIndexer.nbtcMintTxsBySuiAddr).toHaveBeenCalledWith(suiAddr);
		expect(Array.isArray(result)).toBe(true);
	});

	it("should return badRequest when indexer throws", async () => {
		const suiAddr = "0x1234567890abcdef1234567890abcdef12345678";
		vi.mocked(mockIndexer.nbtcMintTxsBySuiAddr).mockRejectedValue(new Error("Network error"));

		const result = await controller["getMintTxs"](null, suiAddr);

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(400);
	});

	it("should skip invalid SUI address", async () => {
		const btcAddr = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
		const invalidSuiAddr = "invalid-sui-address";

		vi.mocked(mockIndexer.depositsBySender).mockResolvedValue([mockNbtcTxResp]);

		await controller["getMintTxs"](btcAddr, invalidSuiAddr);

		expect(mockIndexer.nbtcMintTxsBySuiAddr).not.toHaveBeenCalled();
		expect(mockIndexer.depositsBySender).toHaveBeenCalledWith(btcAddr, 1);
	});
});
