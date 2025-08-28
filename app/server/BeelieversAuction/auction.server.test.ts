import { describe, test, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from "vitest";
import { Miniflare } from "miniflare";
import type { User } from "./types";

import { Auction, addDynamicBadges } from "./auction.server";

interface AmountBids {
	amount: number;
	bids: number;
}

function extractAB(bidder: User | null): AmountBids | null {
	if (!bidder) return null;
	return {
		amount: bidder.amount,
		bids: bidder.bids,
	};
}

function toAB(amount: number, bids: number) {
	return { amount, bids };
}

describe("Auction Class with Tuple Error Handling", () => {
	let worker: Miniflare;
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
	const b_1_16 = [1, 2, 3, 4, 5, 6, 15, 16];
	const b_2_16 = [2, 3, 4, 5, 6, 15, 16];
	const b_2_20 = [2, 3, 4, 5, 6, 15, 16, 20];
	const b_3_20 = [3, 4, 5, 6, 15, 16, 20];
	const b_1_20 = [1, ...b_2_20];

	const note = "Going for the win!";

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
		vi.useFakeTimers();
		const db = await worker.getD1Database("DB");
		await db.exec("DROP TABLE IF EXISTS bids; DROP TABLE IF EXISTS stats;");

		// Setting auction window around the user's provided time for context
		vi.setSystemTime(now);

		auction = new Auction(db, timeStart, timeEnd, auctionSize, minBid, null);
		await auction.initialize();
	});
	afterEach(() => {
		vi.useRealTimers();
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

	test("queryBidder-insertBidder", async () => {
		let b = await auction.getBidder(alice);
		expect(b).toBeNull();

		let res = await auction._insertBidder(alice, 0, now);
		expect(res.success, res.error).toBeTruthy();
		b = await auction.getBidder(alice);
		expect(b).toEqual({ amount: 0, badges: [], note: null, wlStatus: 0, rank: null, bids: 0 });

		// check clearing price
		let cp = await auction.getClearingPrice();
		expect(cp).toBe(minBid);

		// leaderboard should only consider people who bid > 0
		let l = await auction.getTopLeaderboard();
		expect(l).toEqual([]);

		res = await auction._insertBidder(users.bob, minBid * 2, now);
		expect(res.success, res.error).toBeTruthy();
		cp = await auction.getClearingPrice();
		expect(cp).toBe(minBid);
		l = await auction.getTopLeaderboard();
		const badges = [1, 2, 3, 4, 5, 6];
		// bids is zero because we manually insert
		expect(l).toEqual([{ amount: 200, badges, bidder: "bob", note: null, rank: 1, bids: 0 }]);
	});

	describe("bid", () => {
		test("successful bid", async () => {
			let [res, err] = await auction.bid(alice, minBid, 100, "Success!");
			expect(err).toBeNull();
			expect(res).toEqual({ oldRank: null, newRank: 1 });
			let bidder = await auction.getBidder(alice);
			expect(extractAB(bidder)).toEqual(toAB(minBid, 1));

			[res, err] = await auction.bid(alice, 101, 100, "Success2!");
			expect(err).toBeNull();
			expect(res).toEqual({ oldRank: 1, newRank: 1 });
			bidder = await auction.getBidder(alice);
			expect(bidder?.note).toEqual("Success2!");
			expect(extractAB(bidder)).toEqual(toAB(101, 2));

			[res, err] = await auction.bid(alice, 102, 100, ""); // no note
			expect(err).toBeNull();

			const l = await auction.getTopLeaderboard();
			expect(l).toEqual([
				{
					amount: 102,
					badges: [...b_1_20, 24],
					bidder: "alice",
					note: "Success2!",
					rank: 1,
					bids: 3,
				},
			]);

			const w = await auction.getWinners();
			expect(w).toEqual([alice]);

			const tx = auction.db
				.prepare(
					"UPDATE stats SET totalBids = totalBids + 1, uniqueBidders = uniqueBidders + ? WHERE key = 'auction_stats' RETURNING uniqueBidders",
				)
				.bind(10);
			const r = await auction.db.batch([tx]);
			expect(r[0].results[0]).toEqual({ uniqueBidders: 11 });
		});

		test("error: subsequent bid too low", async () => {
			// first bid OK
			const firstBid = minBid * 2;
			let [res, err] = await auction.bid(alice, firstBid);
			expect(res).toBeDefined();
			expect(err).toBeNull();

			[res, err] = await auction.bid(alice, firstBid);
			expect(err).toBeInstanceOf(Error);
			expect(err?.message).toContain("must be greater than the previous effective bid");

			[res, err] = await auction.bid(alice, firstBid - 1);
			expect(err).toBeInstanceOf(Error);
			expect(err?.message).toContain("must be greater than the previous effective bid");

			// data shouldn't change
			const bidder = await auction.getBidder(alice);
			expect(bidder).toEqual({
				amount: firstBid,
				badges: b_1_20,
				bids: 1,
				note: "",
				rank: 1,
				wlStatus: 0,
			});
		});

		test("error: auction has not started", async () => {
			auction.startDate = timeEnd; // we don't change the current time
			const [result, error] = await auction.bid(alice, minBid);

			expect(result).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toBe("Auction has not started yet.");
			const bidder = await auction.getBidder(alice);
			expect(bidder).toBeNull();
		});

		test("error: auction has ended", async () => {
			auction.endDate = timeBefore;
			const [result, error] = await auction.bid("user1", minBid);

			expect(result).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toBe("Auction has already ended.");
		});

		test("boost", async () => {
			const r = await auction._insertBidder(alice, 0, now, 2);
			expect(r.success, r.error).toBeTruthy();

			let [res, err] = await auction.bid(alice, minBid, 100, "Success!");
			expect(err).toBeNull();
			expect(res).toEqual({ oldRank: null, newRank: 1 });
			const b = await auction.getBidder(alice);
			expect(b?.amount).toEqual(minBid * 1.05);

			[res, err] = await auction.bid(alice, 1000, 100, "Success!");
			expect(err).toBeNull();
			expect(res).toEqual({ oldRank: 1, newRank: 1 });

			const l = await auction.getTopLeaderboard();
			expect(l[0].amount).toEqual(1000 * 1.05);
		});
	});

	describe("Full Auction Flow with Tuple Handling", () => {
		test("should correctly handle the auction lifecycle", async () => {
			// 1. BIDDING PHASE - successful bids
			let [res, err] = await auction.bid(users.alice, 600, 100, note);
			expect(res).toEqual({ oldRank: null, newRank: 1 });
			[res, err] = await auction.bid(users.bob, 700);
			expect(res).toEqual({ oldRank: null, newRank: 1 });
			[res, err] = await auction.bid(users.charl, 500);
			expect(res).toEqual({ oldRank: null, newRank: 3 });

			let stats = await auction.getStats();
			expect(stats).toEqual({
				totalBids: 3,
				uniqueBidders: 3,
				topBids: [
					{
						rank: 1,
						bids: 1,
						amount: 700,
						bidder: users.bob,
						badges: [...b_1_16, 26],
						note: "",
					},
					{ rank: 2, bids: 1, amount: 600, bidder: users.alice, badges: b_2_16, note },
					{ rank: 3, bids: 1, amount: 500, bidder: "charl", badges: b_2_20, note: "" },
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
			expect(auction.size).toBe(4);
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
			const b_3_16 = [3, 4, 5, 6, 15, 16];
			expect(stats).toEqual({
				totalBids: 9,
				uniqueBidders: 6,
				topBids: [
					{
						rank: 1,
						bids: 2,
						amount: 800,
						bidder: users.charl,
						badges: [1, 2, 3, 4, 5, 6, 15, 16, 23, 26], // TODO: dup
						note: "",
					},
					{
						rank: 2,
						bids: 3,
						amount: 750,
						bidder: users.bob,
						badges: [...b_2_16, 24, 26],
						note: "",
					},
					{
						rank: 3,
						bids: 1,
						amount: 600,
						bidder: users.alice,
						badges: b_2_16,
						note: "Going for the win!",
					},
					{
						rank: 4,
						bids: 1,
						amount: 320,
						bidder: users.eve,
						badges: b_3_20,
						note: "",
					},
					{
						rank: 5,
						bids: 1,
						amount: 310,
						bidder: users.dylan,
						badges: b_3_16,
						note: "",
					},
					{
						rank: 6,
						bids: 1,
						amount: 300,
						bidder: users.felix,
						badges: b_3_16,
						note: "",
					},
				],
			});
			const w = await auction.getWinners();
			expect(w).toEqual([users.charl, users.bob, users.alice, users.eve]);
		});
	});

	describe("badges", () => {
		test("dynamic add", () => {
			const charl = {
				amount: 800,
				badges: [15, 16, 26],
				note: "",
				wlStatus: 0,
				bids: 2,
				rank: 1,
			};
			const lastRank = 4;
			addDynamicBadges(charl, lastRank);
			expect(charl.badges).toEqual([1, 2, 3, 4, 5, 6, 15, 16, 23, 26]);
		});
	});
});
