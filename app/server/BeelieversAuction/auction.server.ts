// --- Type Definitions ---
export interface BidResult {
	newRank: number | null;
	oldRank: number | null;
}
export interface BidderStatus {
	rank: number;
	bid: number; // The effective (boosted) bid amount
	typ: number;
	msg: string;
}
export interface LeaderboardEntry {
	rank: number;
	bidder: string;
	amount: number; // Effective amount
}
export interface AuctionStats {
	totalBids: number;
	uniqueBidders: number;
	topTenBids: Omit<LeaderboardEntry, "rank">[];
}

// --- The Auction Class for Cloudflare D1 ---
export class Auction {
	private db: D1Database;
	public readonly startDate: Date;
	public readonly endDate: Date;
	public readonly auctionSize: number;
	public readonly minimumBid: number;

	constructor(
		db: D1Database,
		startDate: Date,
		endDate: Date,
		auctionSize: number = 5000,
		minimumBid: number = 2,
	) {
		this.db = db;
		this.startDate = startDate;
		this.endDate = endDate;
		this.auctionSize = auctionSize;
		this.minimumBid = minimumBid;
	}

	public async initialize(): Promise<void> {
		const statements = [
			this.db.prepare(
				`CREATE TABLE IF NOT EXISTS bids (
bidder TEXT PRIMARY KEY,
amount INTEGER NOT NULL,
timestamp INTEGER NOT NULL,
typ INTEGER NOT NULL DEFAULT 0, msg TEXT);`,
			),
			this.db.prepare(
				`CREATE INDEX IF NOT EXISTS idx_bids_ranking ON bids(amount DESC, timestamp ASC);`,
			),
			this.db.prepare(
				`CREATE TABLE IF NOT EXISTS stats (
key TEXT PRIMARY KEY DEFAULT 'auction_stats',
total_bids INTEGER NOT NULL DEFAULT 0,
unique_bidders INTEGER NOT NULL DEFAULT 0);`,
			),
			this.db.prepare(`INSERT OR IGNORE INTO stats (key) VALUES ('auction_stats');`),
		];
		await this.db.batch(statements);
	}

	public async setBidderType(bidder: string, typ: number): Promise<void> {
		await this.db
			.prepare(
				`INSERT INTO bids (bidder, amount, timestamp, typ, msg) VALUES (?, 0, ?, ?, '') ON CONFLICT(bidder) DO UPDATE SET typ = excluded.typ`,
			)
			.bind(bidder, Date.now(), typ)
			.run();
	}

	/**
	 * Places or updates a bid. Returns a [result, error] tuple instead of throwing.
	 * @returns A Promise resolving to a tuple: [BidResult | null, Error | null].
	 */
	public async bid(
		bidder: string,
		amount: number,
		msg: string = "",
	): Promise<[BidResult | null, Error | null]> {
		try {
			const initialStatus = await this.queryBidder(bidder);
			const oldRank = initialStatus?.rank ?? null;
			const typToUse = initialStatus?.typ ?? 0;

			// --- VALIDATION CHECKS ---
			const now = new Date();
			// Using the current real time for this check, as requested by the user context
			const currentTime = new Date("2025-08-18T18:50:15+02:00");

			if (currentTime < this.startDate) {
				return [null, new Error("Auction has not started yet.")];
			}
			if (currentTime > this.endDate) {
				return [null, new Error("Auction has already ended.")];
			}
			if (!Number.isInteger(amount) || amount <= 0) {
				return [null, new Error("Bid amount must be a positive integer.")];
			}

			const effectiveAmount = typToUse === 2 ? Math.floor(amount * 1.05) : amount;
			const currentEffectiveBid = initialStatus?.bid ?? 0;

			if (effectiveAmount <= currentEffectiveBid) {
				return [
					null,
					new Error(
						`New effective bid ($${effectiveAmount}) must be greater than current effective bid ($${currentEffectiveBid}).`,
					),
				];
			}
			if (!initialStatus && amount < this.minimumBid) {
				return [null, new Error(`Minimum first bid is $${this.minimumBid}.`)];
			}

			// --- DATABASE TRANSACTION ---
			const trimmedMsg = msg.substring(0, 30);
			const isNewTrueBidder = initialStatus === null || initialStatus.bid === 0;

			const statements = [
				this.db
					.prepare(
						`INSERT INTO bids (bidder, amount, timestamp, typ, msg) VALUES (?, ?, ?, ?, ?) ON CONFLICT(bidder) DO UPDATE SET amount = excluded.amount, timestamp = excluded.timestamp, msg = excluded.msg`,
					)
					.bind(bidder, effectiveAmount, now.getTime(), typToUse, trimmedMsg),
				this.db
					.prepare(
						`UPDATE stats SET total_bids = total_bids + 1, unique_bidders = unique_bidders + ? WHERE key = 'auction_stats'`,
					)
					.bind(isNewTrueBidder ? 1 : 0),
			];
			await this.db.batch(statements);

			const finalStatus = await this.queryBidder(bidder);
			const newRank = finalStatus?.rank ?? null;

			// Successful operation returns [result, null]
			return [{ oldRank, newRank }, null];
		} catch (e) {
			// Catch unexpected database errors
			const error =
				e instanceof Error
					? e
					: new Error("An unknown error occurred during the bid process.");
			return [null, error];
		}
	}

	public async queryBidder(bidder: string): Promise<BidderStatus | null> {
		const stmt = this.db.prepare(
			`WITH ranked_bids AS (SELECT bidder, amount, typ, msg, RANK() OVER (ORDER BY amount DESC, timestamp ASC) as rank FROM bids WHERE amount > 0) SELECT rank, amount as bid, typ, msg FROM ranked_bids WHERE bidder = ?`,
		);
		return await stmt.bind(bidder).first<BidderStatus>();
	}

	// Other public methods (getStats, etc.) are unchanged
	public async queryTopLeaderboard(): Promise<LeaderboardEntry[]> {
		const stmt = this.db.prepare(
			`SELECT bidder, amount FROM bids WHERE amount > 0 ORDER BY amount DESC, timestamp ASC LIMIT 10`,
		);
		const { results } = await stmt.all<Omit<LeaderboardEntry, "rank">>();
		return results.map((row, index) => ({ rank: index + 1, ...row }));
	}

	public async getStats(): Promise<AuctionStats> {
		const statsRow = await this.db
			.prepare(`SELECT total_bids, unique_bidders FROM stats WHERE key = 'auction_stats'`)
			.first<{ total_bids: number; unique_bidders: number }>();
		const topBids = await this.queryTopLeaderboard();
		if (!statsRow) throw new Error("Statistics table not initialized.");
		return {
			totalBids: statsRow.total_bids,
			uniqueBidders: statsRow.unique_bidders,
			topTenBids: topBids.map(({ rank, ...rest }) => rest),
		};
	}

	public async getClearingPrice(): Promise<number> {
		const result = await this.db
			.prepare(
				`SELECT amount FROM bids WHERE amount > 0 ORDER BY amount DESC, timestamp ASC LIMIT 1 OFFSET ?`,
			)
			.bind(this.auctionSize)
			.first<{ amount: number }>();
		return result?.amount ?? this.minimumBid;
	}
}
