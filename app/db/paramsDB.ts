import { logError } from "~/lib/log";

const RECOMMENDED_FEE_KEY = "recommendedFee";

export class ParamsDB {
	db: D1Database;

	constructor(db: D1Database) {
		this.db = db;
	}

	async insertRecommendedBitcoinFees(fees: { setupId: number; fee: number }[]): Promise<void> {
		try {
			const stmt = this.db.prepare(`
					INSERT INTO params (setup_id, name, value)
					VALUES (?, ${RECOMMENDED_FEE_KEY}, ?)
					ON CONFLICT(setup_id, name) DO UPDATE SET
						value = excluded.value;
				`);

			const feesToInsert = fees.map(({ setupId, fee }) => stmt.bind(setupId, fee));
			await this.db.batch(feesToInsert);
		} catch (error) {
			logError({
				msg: "Failed to insert the recommended fees",
				method: "insertRecommendedBitcoinFee",
				error,
			});
		}
	}

	async getRecommendedBitcoinFee(setupId: number): Promise<number | null> {
		try {
			const row = await this.db
				.prepare("SELECT value FROM params WHERE setup_id = ? and name = ?")
				.bind(setupId, RECOMMENDED_FEE_KEY)
				.first<{ value: number }>();

			return row?.value ?? null;
		} catch (error) {
			logError({
				msg: "Failed to get the recommended fee",
				method: "getRecommendedBitcoinFee",
				error,
			});
			return null;
		}
	}
}
