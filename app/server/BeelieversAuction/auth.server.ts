import { SuiClient, type SuiTransactionBlockResponse } from "@mysten/sui/client";
import { verifyTransactionSignature } from "@mysten/sui/verify";
import { TransactionDataBuilder } from "@mysten/sui/transactions";

import { delay } from "~/lib/batteries";

export type BidTxEvent = {
	sender: string;
	auctionId: string;
	totalBidAmount: string;
};

interface TxData {
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
}

interface SuiJsonRpcResponse {
	jsonrpc: string;
	id: number;
	result?: TxData;
}

type TxCheckError = string;

// Returns BidDetails on successful tx verification, or TxCheckError otherwise.
function processTransactionData(
	data: TxData | undefined,
	suiTxId: string,
	bidderAddr: string,
	source: "Primary" | "Fallback",
	trustedPackageId: string,
): BidTxEvent | TxCheckError {
	if (!data) {
		throw new Error(`[${source}] Response did not contain a result object for tx: ${suiTxId}`);
	}

	if (data.effects?.status?.status !== "success") {
		const statusDetails = JSON.stringify(data.effects?.status, null, 2);
		return `[${source}] Transaction ${suiTxId} was not successful. Status: ${statusDetails}`;
	}

	const expectedEventType = `${trustedPackageId}::auction::BidEvent`;
	const bidEvent = data?.events?.find((e) => e.type === expectedEventType);

	if (!bidEvent) {
		return `[${source}] Could not find BidEvent from package ${trustedPackageId} in tx ${suiTxId}`;
	}

	const { auction_id, total_bid_amount } = bidEvent.parsedJson as {
		auction_id: string;
		total_bid_amount: string;
	};
	const sender = bidEvent.sender;

	if (sender !== bidderAddr) {
		return `[${source}] WARNING: Event sender ${sender} does not match provided bidder address ${bidderAddr} for tx ${suiTxId}.`;
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
	trustedPackageId: string,
	indexerUrl: string,
): Promise<BidTxEvent | TxCheckError> {
	const MAX_ATTEMPT = 2;
	const RETRY_DELAY_MS = 1000;

	for (let attempt = 1; attempt <= MAX_ATTEMPT; attempt++) {
		try {
			console.log(`[Fallback] Querying public Suivision indexer for tx: ${suiTxId}`);
			const response = await fetch(indexerUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jsonrpc: "2.0",
					id: suiTxId,
					method: "sui_getTransactionBlock",
					params: [suiTxId, { showEffects: true, showEvents: true }],
				}),
			});

			if (!response.ok) {
				throw new Error(`API returned an error: ${response.status} ${response.statusText}`);
			}

			const jsonResponse: SuiJsonRpcResponse = await response.json();
			return processTransactionData(
				jsonResponse.result,
				suiTxId,
				bidderAddr,
				"Fallback",
				trustedPackageId,
			);
		} catch (error) {
			console.error(`[Fallback] Attempt ${attempt} failed for tx ${suiTxId}:`, error);

			if (attempt < MAX_ATTEMPT) {
				console.log(`[Fallback] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
				await delay(RETRY_DELAY_MS);
			}
		}
	}
	return `[Fallback] All ${MAX_ATTEMPT} attempts failed for tx ${suiTxId}.`;
}

export async function checkTxOnChain(
	suiClient: SuiClient,
	suiTxId: string,
	bidderAddr: string,
	trustedPackageId: string,
	indexerURL: string,
): Promise<BidTxEvent | TxCheckError> {
	try {
		console.log(`[Primary] Querying Sui RPC for tx: ${suiTxId}`);
		const tx: SuiTransactionBlockResponse = await suiClient.getTransactionBlock({
			digest: suiTxId,
			options: {
				showEffects: true,
				showEvents: true,
			},
		});
		return processTransactionData(tx, suiTxId, bidderAddr, "Primary", trustedPackageId);
	} catch (error) {
		console.error(`[Primary] Error querying Sui RPC for tx ${suiTxId}:`, error);
		console.log("[Primary] RPC failed. Attempting to use fallback indexer...");
		await delay(500);
		return queryIndexerFallback(suiTxId, bidderAddr, trustedPackageId, indexerURL);
	}
}

// Returns null on verification failure
export async function verifySignature(
	userAddr: string,
	tx_bytes: Uint8Array,
	signature: string,
): Promise<string | null> {
	try {
		// throws exception on tx verification:
		// https://github.com/MystenLabs/ts-sdks/blob/main/packages/typescript/src/verify/verify.ts
		// return pub key
		await verifyTransactionSignature(tx_bytes, signature, {
			address: userAddr,
		});

		return TransactionDataBuilder.getDigestFromBytes(tx_bytes);
	} catch (_e) {
		return null;
	}
}
