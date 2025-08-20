import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { Miniflare } from "miniflare";

import { Auction } from "./auction.server";

interface TestContext {
	auction: Auction;
}

describe("Auction Class with Tuple Error Handling", () => {
	let worker;

	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	beforeEach<TestContext>(async (context) => {
		// Setting auction window around the user's provided time for context
		const startTime = new Date("2025-08-18T18:00:00+02:00"); // CEST
		const endTime = new Date("2025-08-18T19:00:00+02:00"); // CEST
		vi.setSystemTime(new Date("2025-08-18T18:50:15+02:00"));

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

		const db = await worker.getD1Database("DB");
		await db.exec("DROP TABLE IF EXISTS bids; DROP TABLE IF EXISTS stats;");

		context.auction = new Auction(db, startTime, endTime, 10, 10);
		await context.auction.initialize();
	});

	describe("Initialization", () => {
		test<TestContext>("initialize and stats", async ({ auction }) => {
			// The auction is initialized in beforeEach, we can re-initialize to test
			// await expect(auction.initialize()).resolves.toBeUndefined();

			const stats = await auction.getAuctionTopStats();
			expect(stats).toBeDefined();
			expect(stats).toEqual({ totalBids: 0, uniqueBidders: 0 });
		});
	});

	describe("bid", () => {
		test<TestContext>("should return a result and null error for a successful bid", async ({
			auction,
		}) => {
			const [result, error] = await auction.bid("user1", 100, "Success!");

			expect(error).toBeNull();
			expect(result).toEqual({ oldRank: null, newRank: 1 });
		});

		test<TestContext>("should return a null result and an error if bid is too low", async ({
			auction,
		}) => {
			await auction.bid("user1", 50);
			const [result, error] = await auction.bid("user1", 40);

			expect(result).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toContain("must be greater than current effective bid");
		});

		test<TestContext>("should return an error if auction has not started", async ({
			auction,
		}) => {
			auction.startDate = new Date("2025-08-18T19:00:00+02:00");
			const [result, error] = await auction.bid("user1", 20);

			expect(result).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toBe("Auction has not started yet.");
		});

		test<TestContext>("should return an error if auction has ended", async ({ auction }) => {
			auction.endDate = new Date("2025-08-18T18:30:00+02:00");
			const [result, error] = await auction.bid("user1", 20);

			expect(result).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toBe("Auction has already ended.");
		});
	});

	describe.skip("Full Auction Flow with Tuple Handling", () => {
		test<TestContext>("should correctly handle the auction lifecycle", async ({ auction }) => {
			auction["auctionSize"] = 3;

			// 1. BIDDING PHASE - successful bids
			const [res_alice, err_alice] = await auction.bid("Alice", 800, "Going for the win!");
			expect(err_alice).toBeNull();
			expect(res_alice?.newRank).toBe(1);

			await auction.bid("Bob", 700);
			await auction.bid("Charlie", 650);

			// 2. Invalid bid attempt
			const [res_eve_fail, err_eve_fail] = await auction.bid("Eve", 300); // Less than her current bid of 0
			expect(err_eve_fail).toBeInstanceOf(Error);
			expect(res_eve_fail).toBeNull();

			await auction.bid("Eve", 400); // Now a valid bid

			// 3. AUCTION ENDS
			auction["endDate"] = new Date("2025-08-18T18:40:00+02:00");
			const [res_frank, err_frank] = await auction.bid("Frank", 900);
			expect(err_frank).toBeInstanceOf(Error);
			expect(err_frank?.message).toBe("Auction has already ended.");
			expect(res_frank).toBeNull();

			// 4. RESULTS VERIFICATION
			const clearingPrice = await auction.getClearingPrice();
			// Leaderboard: Alice (800), Bob (700), Charlie (650), Eve (400)
			// Highest loser is Eve. Clearing price is her bid.
			expect(clearingPrice).toBe(400);
		});
	});
});
