import type { SuiClient } from "@mysten/sui/client";
import { logError } from "./log";

interface GetCoinForAmountI {
	coins: {
		coinObjectId: string;
		balance: string;
	}[];
	fulfilled: boolean;
}

// Returns enough coins that total to at least the required amount
export async function getCoinsForAmount(
	senderAddress: string,
	client: SuiClient,
	coinType: string,
	requiredAmount: bigint,
): Promise<GetCoinForAmountI> {
	try {
		const coins: GetCoinForAmountI["coins"] = [];
		let hasNextPage = true;
		let cursor: string | null = null;
		let totalBalance = 0n;

		while (hasNextPage && totalBalance < requiredAmount) {
			const page = await client.getCoins({
				owner: senderAddress,
				coinType,
				cursor,
			});
			const pageCoins = page.data ?? [];

			if (!pageCoins.length) {
				break;
			}

			for (const coin of pageCoins) {
				coins.push(coin);
				totalBalance += BigInt(coin.balance);
				if (totalBalance >= requiredAmount) {
					break;
				}
			}

			hasNextPage = page.hasNextPage;
			cursor = page.nextCursor || null;
		}
		return { coins, fulfilled: totalBalance >= requiredAmount };
	} catch (error) {
		logError({ msg: "can't fulfull the request", method: "getCoinsForAmount" }, error);
		return { coins: [], fulfilled: false };
	}
}
