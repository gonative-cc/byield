import { SuiClient } from "@mysten/sui/client";

//TODO: We should configure the trusted packaged_id in env.
const TRUSTED_PACKAGE_ID = "0xCAFE";

export type BidDetails = {
	sender: string;
	auctionId: string;
	totalBidAmount: string;
};

async function queryIndexerFallback(
	suiTxId: string,
	bidderAddr: string
): Promise<BidDetails | null> {
	try {
		//TODO: add fallback logic to call indexer
		return null;
	} catch (error) {
		console.error(`The indexer also failed for tx ${suiTxId}:`, error);
		return null;
	}
}

export async function validateBidTransaction(
	suiClient: SuiClient,
	suiTxId: string,
	bidderAddr: string
): Promise<BidDetails | null> {
	try {
		const tx = await suiClient.getTransactionBlock({
			digest: suiTxId,
			options: {
				showEffects: true,
				showEvents: true,
			},
		});

		const status = tx.effects?.status;
		if (!status || status.status !== "success") {
			console.error(
				`Transaction ${suiTxId} was not successful. Status:`,
				status?.status,
				status?.error
			);
			return null;
		}

		const expectedEventType = `${TRUSTED_PACKAGE_ID}::auction::BidEvent`;
		const bidEvent = tx.events?.find((e) => e.type === expectedEventType);

		if (!bidEvent) {
			console.error(`Could not find BidEvent in successful transaction ${suiTxId}`);
			return null;
		}

		const { auction_id, total_bid_amount } = bidEvent.parsedJson as {
			auction_id: string;
			total_bid_amount: string;
		};
		const sender = bidEvent.sender;

		if (sender !== bidderAddr) {
			console.warn(
				`Event sender ${sender} does not match provided bidder address ${bidderAddr} for tx ${suiTxId}.`
			);
			return null;
		}

		return {
			sender,
			auctionId: auction_id,
			totalBidAmount: total_bid_amount,
		};
	} catch (error) {
		console.error(`Error querying Sui RPC for tx ${suiTxId}:`, error);
		console.log("RPC failed. Attempting to use fallback indexer...");
		return queryIndexerFallback(suiTxId, bidderAddr);
	}
}
