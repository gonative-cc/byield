import type { MintTransaction } from "~/server/Mint/types";
import { MintingTxStatus } from "~/server/Mint/types";

export type NbtcTxStatus = "confirming" | "finalized" | "minted" | "failed" | "reorg";

export interface IndexerMintTransaction {
	bitcoin_tx_id: string;
	amount_satoshi: number;
	status: NbtcTxStatus;
	sui_recipient: string;
	sui_tx_id?: string;
	timestamp: number;
	confirmations: number;
	fees?: number;
	error_message?: string;
}

export interface IndexerResponse {
	transactions: IndexerMintTransaction[];
	total: number;
}

/**
 * Maps indexer status to our internal MintingTxStatus
 * Indexer statuses: "confirming" | "finalized" | "minted" | "failed" | "reorg"
 */
function mapIndexerStatus(status: NbtcTxStatus): MintingTxStatus {
	switch (status) {
		case "confirming":
			return MintingTxStatus.CONFIRMING;
		case "finalized":
			return MintingTxStatus.MINTING; // Bitcoin finalized, now minting nBTC on Sui
		case "minted":
			return MintingTxStatus.MINTED;
		case "failed":
			return MintingTxStatus.FAILED;
		case "reorg":
			return MintingTxStatus.FAILED; // Treat reorg as failed
		default:
			return MintingTxStatus.CONFIRMING; // Default to confirming if unknown
	}
}

/**
 * Maps indexer transaction to our internal MintTransaction format
 */
function mapIndexerTransaction(indexerTx: IndexerMintTransaction): MintTransaction {
	return {
		bitcoinTxId: indexerTx.bitcoin_tx_id.startsWith("0x")
			? indexerTx.bitcoin_tx_id
			: `0x${indexerTx.bitcoin_tx_id}`,
		amountInSatoshi: indexerTx.amount_satoshi,
		status: mapIndexerStatus(indexerTx.status),
		suiAddress: indexerTx.sui_recipient,
		suiTxId: indexerTx.sui_tx_id || "",
		timestamp: indexerTx.timestamp,
		numberOfConfirmation: indexerTx.confirmations,
		recipient: indexerTx.sui_recipient,
		operationStartDate: indexerTx.timestamp,
		fees: indexerTx.fees,
		bitcoinExplorerUrl: `https://mempool.space/testnet4/tx/${indexerTx.bitcoin_tx_id.replace("0x", "")}`,
		suiExplorerUrl: indexerTx.sui_tx_id
			? `https://suiscan.xyz/testnet/tx/${indexerTx.sui_tx_id}`
			: "https://suiscan.xyz/testnet/tx/",
		errorMessage: indexerTx.error_message,
	};
}

/**
 * Fetches mint transactions for a specific Sui recipient from the indexer
 */
export async function fetchMintTransactions(
	indexerUrl: string,
	suiRecipient?: string,
): Promise<MintTransaction[]> {
	try {
		const url = new URL(`${indexerUrl}/nbtc`);
		if (suiRecipient) {
			url.searchParams.set("sui_recipient", suiRecipient);
		}

		console.log("🔍 Fetching mint transactions from indexer:", url.toString());
		console.log(
			"📋 Status mapping: confirming→Confirming, finalized→Minting, minted→Minted, failed/reorg→Failed",
		);

		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			mode: "cors", // Explicitly set CORS mode
		});

		if (!response.ok) {
			throw new Error(`Indexer API error: ${response.status} ${response.statusText}`);
		}

		const data: IndexerResponse | IndexerMintTransaction[] = await response.json();

		// Handle both response formats (array or object with transactions)
		const transactions = Array.isArray(data) ? data : data.transactions || [];

		console.log(`📊 Retrieved ${transactions.length} transactions from indexer`);

		return transactions.map(mapIndexerTransaction);
	} catch (error) {
		console.error("❌ Failed to fetch mint transactions from indexer:", error);

		// Check if it's a CORS error
		if (error instanceof TypeError && error.message === "Failed to fetch") {
			console.warn("🚧 CORS issue detected. This is expected in development mode.");
			console.warn("💡 In production, the indexer should have proper CORS headers.");
			throw new Error("CORS error - indexer not accessible from browser");
		}

		throw error;
	}
}

/**
 * Fetches a specific mint transaction by Bitcoin TX ID
 */
export async function fetchMintTransaction(
	indexerUrl: string,
	bitcoinTxId: string,
): Promise<MintTransaction | null> {
	try {
		const cleanTxId = bitcoinTxId.replace("0x", "");
		const url = `${indexerUrl}/nbtc/${cleanTxId}`;

		console.log("🔍 Fetching single transaction from indexer:", url);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			throw new Error(`Indexer API error: ${response.status} ${response.statusText}`);
		}

		const indexerTx: IndexerMintTransaction = await response.json();
		return mapIndexerTransaction(indexerTx);
	} catch (error) {
		console.error("❌ Failed to fetch transaction from indexer:", error);
		throw error;
	}
}
