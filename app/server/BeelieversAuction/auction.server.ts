import type { Bidder, User } from "./types";

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
			// TODO: test boost
			const effectiveAmount =
				(prevBid?.wlStatus ?? 0) > 0 ? Math.floor(amount * 1.05) : amount;
			const currentEffectiveBid = prevBid?.amount ?? 0;

			if (effectiveAmount <= currentEffectiveBid) {
				return [
					null,
					new Error(
						`New effective bid (${effectiveAmount}) must be greater than current effective bid (${currentEffectiveBid}).`,
					),
				];
			}
			if (!prevBid && amount < this.minimumBid) {
				return [null, new Error(`Minimum first bid is ${this.minimumBid}.`)];
			}

			note = note.substring(0, 30);
			if (prevBid !== null && !note && !prevBid.note) note = prevBid.note;
			const isNewBidder = prevBid === null || prevBid.amount === 0;

			// --- DATABASE TRANSACTION ---
			const statements = [
				this.db
					.prepare(
						`INSERT INTO bids (bidder, amount, timestamp, note) VALUES (?, ?, ?, ?) ON CONFLICT(bidder) DO UPDATE SET amount = excluded.amount, timestamp = excluded.timestamp, note = excluded.note`,
					)
					.bind(bidder, effectiveAmount, now.getTime(), note),
				this.db
					.prepare(
						`UPDATE stats SET totalBids = totalBids + 1, uniqueBidders = uniqueBidders + ? WHERE key = 'auction_stats'`,
					)
					.bind(isNewBidder ? 1 : 0),
			];
			await this.db.batch(statements);

			const finalStatus = await this.getBidder(bidder);
			const newRank = finalStatus?.rank ?? null;

			return [{ oldRank, newRank }, null];
		} catch (e) {
			const error =
				e instanceof Error
					? e
					: new Error("An unknown error occurred during the bid process.");
			return [null, error];
		}
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

	// TODO: test and add winners

	//
	// Private methods
	//

	async _insertBidder(bidder: string, amount: number, timestamp: number): Promise<D1Result> {
		return await this.db
			.prepare("INSERT INTO bids (bidder, amount, timestamp) VALUES (?, ?, ?)")
			.bind(bidder, amount, timestamp)
			.run();
	}
}
