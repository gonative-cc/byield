import type { Bidder, User } from "./types";
import { Badge } from "./types";

export interface BidResult {
	newRank: number | null;
	oldRank: number | null;
}

export interface LeaderboardDBEntry {
	bidder: string;
	amount: number; // Effective amount
	badges: string;
	note: string;
}

export interface AuctionAggStats {
	totalBids: number;
	uniqueBidders: number;
}

export interface AuctionStats extends AuctionAggStats {
	topBids: Bidder[];
}

export class Auction {
	db: D1Database;
	startDate: Date;
	endDate: Date;
	size: number;
	minimumBid: number;

	constructor(
		db: D1Database,
		startDate: Date,
		endDate: Date,
		auctionSize: number,
		minimumBid: number = 2e9,
	) {
		this.db = db;
		this.startDate = startDate;
		this.endDate = endDate;
		this.size = auctionSize;
		this.minimumBid = minimumBid;
	}

	// TODO: remove and read from migrations
	async initialize(): Promise<void> {
		const statements = [
			this.db.prepare(
				`CREATE TABLE IF NOT EXISTS bids (
bidder TEXT PRIMARY KEY,
amount INTEGER NOT NULL,
timestamp INTEGER NOT NULL,
wlStatus INTEGER NOT NULL DEFAULT 0,
note TEXT,
badges TEXT DEFAULT "[]");

CREATE INDEX IF NOT EXISTS idx_bids_ranking ON bids(amount DESC, timestamp ASC);

CREATE TABLE IF NOT EXISTS stats (
key TEXT PRIMARY KEY DEFAULT 'auction_stats',
totalBids INTEGER NOT NULL DEFAULT 0,
uniqueBidders INTEGER NOT NULL DEFAULT 0);

INSERT OR IGNORE INTO stats (key) VALUES ('auction_stats');
`,
			),
		];
		await this.db.batch(statements);
	}

	//
	// ---------------------

	/**
	 * Places or updates a bid. Returns a [result, error] tuple instead of throwing.
	 * @returns A Promise resolving to a tuple: [BidResult | null, Error | null].
	 */
	async bid(
		bidder: string,
		amount: number,
		note: string = "",
	): Promise<[BidResult | null, Error | null]> {
		try {
			// TODO: use time from the event
			const now = new Date();
			if (now < this.startDate) {
				return [null, new Error("Auction has not started yet.")];
			}
			if (now > this.endDate) {
				return [null, new Error("Auction has already ended.")];
			}

			const prevBid = await this.getBidder(bidder);
			const oldRank = prevBid?.rank ?? null;

			if (!Number.isInteger(amount) || amount <= 0) {
				return [null, new Error("Bid amount must be a positive integer.")];
			}

			// apply boost
			amount = (prevBid?.wlStatus ?? 0) > 0 ? Math.floor(amount * 1.05) : amount;
			const prevAmount = prevBid?.amount ?? 0;

			if (amount <= prevAmount) {
				return [
					null,
					new Error(
						`New effective bid (${amount}) must be greater than current effective bid (${prevAmount}).`,
					),
				];
			}

			note = note.substring(0, 30);
			if (prevBid !== null && !note && !prevBid.note) {
				note = prevBid.note;
			}
			// amount == 0 if the bidder was inserted manually as a WL user
			const isNewBidder = prevBid === null || prevBid.amount === 0;

			// --- DATABASE TRANSACTION ---
			const statements = [
				this.db
					.prepare(
						`INSERT INTO bids (bidder, amount, timestamp, note) VALUES (?, ?, ?, ?) ON CONFLICT(bidder) DO UPDATE SET amount = excluded.amount, timestamp = excluded.timestamp, note = excluded.note`,
					)
					.bind(bidder, amount, now.getTime(), note),
				this.db
					.prepare(
						`UPDATE stats SET totalBids = totalBids + 1, uniqueBidders = uniqueBidders + ? WHERE key = 'auction_stats' RETURNING uniqueBidders`,
					)
					.bind(isNewBidder ? 1 : 0),
			];
			const result = await this.db.batch(statements);
			const uniqueBidders = (result[1].results[0] as { uniqueBidders: number }).uniqueBidders;
			const newRank = await this._calculateRank(amount, now.getTime());
			let badges = calcBadges(
				amount,
				prevAmount,
				newRank || 1,
				prevBid?.rank || uniqueBidders,
				uniqueBidders,
			);
			let badgesChanged = badges.length > 0;
			if (badgesChanged && prevBid !== null && prevBid.badges.length > 0) {
				badges = mergeBadges(prevBid.badges, badges);
				badgesChanged = badges.length != prevBid.badges.length;
			}
			if (badgesChanged)
				await this.db
					.prepare(`UPDATE bids SET badges = ? WHERE bidder = ?`)
					.bind(JSON.stringify(badges), bidder)
					.run();

			return [{ oldRank, newRank }, null];
		} catch (e) {
			const error =
				e instanceof Error
					? e
					: new Error("An unknown error occurred during the bid process.");
			return [null, error];
		}
	}

	async _calculateRank(amount: number, timestamp: number): Promise<number | null> {
		const higherBids = await this.db
			.prepare(
				`SELECT COUNT(*) as count FROM bids
				WHERE amount > ? OR (amount = ? AND timestamp < ?)`,
			)
			.bind(amount, amount, timestamp)
			.first<{ count: number }>();

		if (higherBids === null) return null;
		return higherBids.count + 1;
	}

	// TODO: optimize
	async getBidder(bidder: string): Promise<User | null> {
		const stmt = this.db.prepare(
			`WITH ranked_bids AS (SELECT bidder, amount, wlStatus, note, badges, RANK() OVER (ORDER BY amount DESC, timestamp ASC) as rank FROM bids WHERE amount > 0)
		SELECT rank, amount, badges, note, wlStatus FROM ranked_bids WHERE bidder = ?`,
		);
		let u = await stmt.bind(bidder).first<User>();
		if (u === null) u = await this._getBidderNoRank(bidder);
		if (u === null) return null;

		// @ts-expect-error u.badges real type is string (from DB), but casted on is list
		u.badges = JSON.parse(u.badges);
		return u;
	}

	// returns User with rank = null
	async _getBidderNoRank(bidder: string): Promise<User | null> {
		const u = await this.db
			.prepare(`SELECT amount, badges, note, wlStatus FROM bids WHERE bidder = ?`)
			.bind(bidder)
			.first<User>();
		if (u !== null) u.rank = null;
		return u;
	}

	// TODO: merge it with getAuctionTopStats in a batch tx
	async getTopLeaderboard(): Promise<Bidder[]> {
		const stmt = this.db.prepare(
			`SELECT bidder, amount, badges, note FROM bids WHERE amount > 0 ORDER BY amount DESC, timestamp ASC LIMIT 10`,
		);
		const { results } = await stmt.all<LeaderboardDBEntry>();
		return results.map(({ bidder, amount, badges, note }, index) => ({
			rank: index + 1,
			bidder,
			amount,
			note,
			badges: JSON.parse(badges),
		}));
	}

	async getAuctionTopStats(): Promise<AuctionAggStats> {
		const row = await this.db
			.prepare(`SELECT totalBids, uniqueBidders FROM stats WHERE key = 'auction_stats'`)
			.first<AuctionAggStats>();
		if (!row) throw new Error("Statistics table not initialized.");
		return row;
	}

	async getStats(): Promise<AuctionStats> {
		const row = (await this.getAuctionTopStats()) as AuctionStats;
		const topBids = await this.getTopLeaderboard();
		if (!row) throw new Error("Statistics table not initialized.");

		row.topBids = topBids;
		return row;
	}

	async getClearingPrice(): Promise<number> {
		const result = await this.db
			.prepare(
				`SELECT amount FROM bids WHERE amount > 0 ORDER BY amount DESC, timestamp ASC LIMIT 1 OFFSET ?`,
			)
			.bind(this.size)
			.first<{ amount: number }>();
		return result?.amount ?? this.minimumBid;
	}

	async getWinners(): Promise<string[]> {
		const result = await this.db
			.prepare(
				`SELECT bidder FROM bids WHERE amount > 0 ORDER BY amount DESC, timestamp ASC LIMIT ?`,
			)
			.bind(this.size)
			.raw<string>();
		return result.flat();
	}

	//
	// Private methods
	//

	async _insertBidder(
		bidder: string,
		amount: number,
		timestamp: Date,
		wlStatus: number = 0,
	): Promise<D1Result> {
		return await this.db
			.prepare("INSERT INTO bids (bidder, amount, timestamp, wlStatus) VALUES (?, ?, ?, ?)")
			.bind(bidder, amount, +timestamp, wlStatus)
			.run();
	}
}

// prevRank - if not assigned previously, then should be assumed to equal
function calcBadges(
	amount: number,
	prevAmount: number,
	rank: number,
	prevRank: number,
	uniqueBidders: number,
): Badge[] {
	const badges = [];
	if (rank === 1) badges.push(Badge.first_place);
	if (rank <= 3) badges.push(Badge.top_3);
	if (rank <= 10) badges.push(Badge.top_10);
	if (rank <= 21) badges.push(Badge.top_21);
	if (rank <= 100) badges.push(Badge.top_100);
	if (rank <= 5810) badges.push(Badge.top_5810);

	const diff = (amount - prevAmount) / 1e9; // convert MIST -> SUI
	if (diff >= 10) badges.push(Badge.bid_over_10);
	if (diff >= 5) badges.push(Badge.bid_over_5);
	if (diff >= 3) badges.push(Badge.bid_over_3);

	const diffRank = prevRank - rank;
	if (diffRank >= 210) badges.push(Badge.climb_up_210);
	if (diffRank >= 10) badges.push(Badge.climb_up_10);

	if (uniqueBidders <= 500) badges.push(Badge.first_500);
	if (uniqueBidders <= 1000) badges.push(Badge.first_1000);

	return badges.sort(cmpNumbers);
}

function mergeBadges(list1: Badge[], list2: Badge[]): Badge[] {
	return [...new Set([...list1, ...list2])].sort(cmpNumbers);
}

function cmpNumbers(a: number, b: number): number {
	return a - b;
}
