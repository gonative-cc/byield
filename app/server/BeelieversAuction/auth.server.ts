import { SuiClient, type SuiTransactionBlockResponse } from "@mysten/sui/client";

export type BidDetails = {
	sender: string;
	auctionId: string;
	totalBidAmount: string;
};

type TxData = {
	effects?: {
		status?: {
			status?: "success" | "failure";
			error?: string;
		};
	} | null;
	events?:
		| {
				type: string;
				parsedJson: unknown;
				sender: string;
		  }[]
		| null;
};

type JsonRpcResponse = {
	jsonrpc: string;
	id: number;
	result?: TxData;
};

//TODO: move it to env, or controller constructor
const TRUSTED_PACKAGE_ID = "0xd5b24b83b168f8656aa7c05af1256e6115de1b80d97be0cddf19297a15535149";

function processTransactionData(
	data: TxData | undefined,
	suiTxId: string,
	bidderAddr: string,
	source: "Primary" | "Fallback",
): BidDetails | null {
	if (!data) {
		console.error(`[${source}] Response did not contain a result object for tx: ${suiTxId}`);
		return null;
	}

	if (data?.effects?.status?.status !== "success") {
		console.error(
			`[${source}] Transaction ${suiTxId} was not successful. Status:`,
			data?.effects?.status,
		);
		return null;
	}

	const expectedEventType = `${TRUSTED_PACKAGE_ID}::auction::BidEvent`;
	const bidEvent = data?.events?.find((e) => e.type === expectedEventType);

	if (!bidEvent) {
		console.error(
			`[${source}] Could not find BidEvent from package ${TRUSTED_PACKAGE_ID} in tx ${suiTxId}`,
		);
		return null;
	}

	const { auction_id, total_bid_amount } = bidEvent.parsedJson as {
		auction_id: string;
		total_bid_amount: string;
	};
	const sender = bidEvent.sender;

	if (sender !== bidderAddr) {
		console.warn(
			`[${source}] Event sender ${sender} does not match provided bidder address ${bidderAddr} for tx ${suiTxId}.`,
		);
		return null;
	}

	console.log(`[${source}] Successfully validated tx ${suiTxId}`);
	return {
		sender,
		auctionId: auction_id,
		totalBidAmount: total_bid_amount,
	};
}

async function queryIndexerFallback(
	suiTxId: string,
	bidderAddr: string,
): Promise<BidDetails | null> {
	try {
		console.log(`[Fallback] Querying public Suivision indexer for tx: ${suiTxId}`);
		// TODO: move it to env, or controller constructor
		const indexerUrl = "https://sui-testnet-endpoint.blockvision.org/";

		const response = await fetch(indexerUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 1,
				method: "sui_getTransactionBlock",
				params: [suiTxId, { showEffects: true, showEvents: true }],
			}),
		});

		if (!response.ok) {
			console.error(
				`[Fallback] Suivision API returned an error: ${response.status} ${response.statusText}`,
			);
			return null;
		}

		const jsonResponse: JsonRpcResponse = await response.json();
		return processTransactionData(jsonResponse.result, suiTxId, bidderAddr, "Fallback");
	} catch (error) {
		console.error(`[Fallback] The indexer also failed for tx ${suiTxId}:`, error);
		return null;
	}
}

export async function validateBidTransaction(
	suiClient: SuiClient,
	suiTxId: string,
	bidderAddr: string,
): Promise<BidDetails | null> {
	try {
		console.log(`[Primary] Querying Sui RPC for tx: ${suiTxId}`);
		const tx: SuiTransactionBlockResponse = await suiClient.getTransactionBlock({
			digest: suiTxId,
			options: {
				showEffects: true,
				showEvents: true,
			},
		});

		return processTransactionData(tx, suiTxId, bidderAddr, "Primary");
	} catch (error) {
		console.error(`[Primary] Error querying Sui RPC for tx ${suiTxId}:`, error);
		console.log("[Primary] RPC failed. Attempting to use fallback indexer...");
		return queryIndexerFallback(suiTxId, bidderAddr);
	}
}
