import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { Miniflare } from "miniflare";

import { Auction } from "./auction.server";

interface TestContext {
	auction: Auction;
}

describe("Auction Class with Tuple Error Handling", () => {
	let worker;
	let auction: Auction;

	const timeBefore = new Date("2024-08-18T17:00:00");
	const timeStart = new Date("2025-08-18T18:00:00");
	const timeEnd = new Date("2025-08-18T19:00:00");
	const now = new Date("2025-08-18T18:50:15");
	const minBid = 100;
	const auctionSize = 4;

	const alice = "alice";
	const users = {
		alice,
		bob: "bob",
		charl: "charl",
		dylan: "dylan",
		eve: "eve",
		felix: "felix",
	};

	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	beforeEach(async () => {
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

		// Setting auction window around the user's provided time for context
		vi.setSystemTime(now);

		auction = new Auction(db, timeStart, timeEnd, auctionSize, minBid);
		await auction.initialize();
	});

	afterEach(async () => {
		worker.dispose();
	});

	describe("Initialization", () => {
		test("initialize and stats", async () => {
			// The auction is initialized in beforeEach, we can re-initialize to test
			// await expect(auction.initialize()).resolves.toBeUndefined();

			const stats = await auction.getAuctionTopStats();
			expect(stats).toBeDefined();
			expect(stats).toEqual({ totalBids: 0, uniqueBidders: 0 });
		});
	});

	describe("bid", () => {
		test("successful bid", async () => {
			let [res, err] = await auction.bid(alice, minBid, "Success!");

			expect(err).toBeNull();
			expect(res).toEqual({ oldRank: null, newRank: 1 });

			[res, err] = await auction.bid(alice, 101, "Success!");
			expect(err).toBeNull();
			expect(res).toEqual({ oldRank: 1, newRank: 1 });
		});

		test("error: first bid too low", async () => {
			const [res, err] = await auction.bid(alice, 99);

			expect(res).toBeNull();
			expect(err).toBeInstanceOf(Error);
			expect(err?.message).toContain("Minimum first bid is 100");
		});

		test("error: subsequent bid too low", async () => {
			// first bid OK
			const firstBid = minBid * 2;
			let [res, err] = await auction.bid(alice, firstBid);
			expect(res).toBeDefined();
			expect(err).toBeNull();

			[res, err] = await auction.bid(alice, firstBid);
			expect(err).toBeInstanceOf(Error);
			expect(err?.message).toContain("must be greater than current effective bid");

			[res, err] = await auction.bid(alice, firstBid - 1);
			expect(err).toBeInstanceOf(Error);
			expect(err?.message).toContain("must be greater than current effective bid");
		});

		test("error: auction has not started", async () => {
			auction.startDate = timeEnd; // we don't change the current time
			const [result, error] = await auction.bid(alice, minBid);

			expect(result).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toBe("Auction has not started yet.");
		});

		test("error: auction has ended", async () => {
			auction.endDate = timeBefore;
			const [result, error] = await auction.bid("user1", minBid);

			expect(result).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toBe("Auction has already ended.");
		});
	});

	describe("Full Auction Flow with Tuple Handling", () => {
		test("should correctly handle the auction lifecycle", async () => {
			// 1. BIDDING PHASE - successful bids
			let [res, err] = await auction.bid(users.alice, 600, "Going for the win!");
			expect(res).toEqual({ oldRank: null, newRank: 1 });
			[res, err] = await auction.bid(users.bob, 700);
			expect(res).toEqual({ oldRank: null, newRank: 1 });
			[res, err] = await auction.bid(users.charl, 500);
			expect(res).toEqual({ oldRank: null, newRank: 3 });

			let stats = await auction.getStats();
			expect(stats).toEqual({
				totalBids: 3,
				uniqueBidders: 3,
				topTenBids: [
					{ amount: 700, bidder: "bob" },
					{ amount: 600, bidder: "alice" },
					{ amount: 500, bidder: "charl" },
				],
			});

			// 2. Invalid Bob bid attempt
			[res, err] = await auction.bid(users.bob, 300); // Less than Bob's current bid
			expect(err).toBeInstanceOf(Error);
			expect(res).toBeNull();

			// Now a valid bid
			[res, err] = await auction.bid(users.bob, 720);
			expect(res).toEqual({ oldRank: 1, newRank: 1 });

			// 3. Charlie bids more
			[res, err] = await auction.bid(users.charl, 800);
			expect(res).toEqual({ oldRank: 3, newRank: 1 });
			// bob tries again, but not enough to beat charlie
			[res, err] = await auction.bid(users.bob, 750);
			expect(res).toEqual({ oldRank: 2, newRank: 2 });

			// 4. A few more bids
			expect(auction.auctionSize).toBe(4);
			[res, err] = await auction.bid(users.dylan, 310); // highest that didn't make it -> clearing price
			expect(res).toEqual({ oldRank: null, newRank: 4 });
			[res, err] = await auction.bid(users.eve, 320);
			expect(res).toEqual({ oldRank: null, newRank: 4 });
			[res, err] = await auction.bid(users.felix, 300); // smallest bid
			expect(res).toEqual({ oldRank: null, newRank: 6 });

			// 3. AUCTION ENDS
			auction.endDate = timeBefore;
			[res, err] = await auction.bid("another_user", 900);
			expect(err?.message).toBe("Auction has already ended.");
			expect(res).toBeNull();

			// 4. RESULTS VERIFICATION
			// Highest loser is dylan. Clearing price is his bid.
			const clearingPrice = await auction.getClearingPrice();
			expect(clearingPrice).toBe(310);

			stats = await auction.getStats();
			expect(stats).toEqual({
				totalBids: 9,
				uniqueBidders: 6,
				topTenBids: [
					{ amount: 800, bidder: "charl" },
					{ amount: 750, bidder: "bob" },
					{ amount: 600, bidder: "alice" },
					{ amount: 320, bidder: "eve" },
					{ amount: 310, bidder: "dylan" },
					{ amount: 300, bidder: "felix" },
				],
			});
		});
	});
});
