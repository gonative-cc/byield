import { type MintTransaction, type NbtcTxStatus } from "~/server/Mint/types";

// Use local proxy in development, direct URL in production
const INDEXER_BASE_URL =
	typeof window !== "undefined" && window.location.hostname === "localhost"
		? "/api/indexer"
		: "https://btcindexer.gonative-cc.workers.dev:443";

interface IndexerTransaction {
	bitcoin_tx_id: string;
	amount_in_satoshi: number;
	status: string;
	sui_address: string;
	sui_tx_id?: string;
	timestamp: number;
	number_of_confirmation: number;
	operation_start_date?: number;
	bitcoin_explorer_url?: string;
	sui_explorer_url?: string;
	fees?: number;
	error_message?: string;
}

// Map indexer status to our NbtcTxStatus
function mapIndexerStatus(status: string): NbtcTxStatus {
	switch (status.toLowerCase()) {
		case "confirming":
			return "confirming";
		case "finalized":
			return "finalized";
		case "minted":
			return "minted";
		case "failed":
			return "failed";
		case "reorg":
			return "reorg";
		default:
			return "confirming";
	}
}

// Convert indexer transaction to our MintTransaction format
function convertIndexerTransaction(tx: IndexerTransaction): MintTransaction {
	return {
		bitcoinTxId: tx.bitcoin_tx_id,
		amountInSatoshi: tx.amount_in_satoshi,
		status: mapIndexerStatus(tx.status),
		suiAddress: tx.sui_address,
		suiTxId: tx.sui_tx_id,
		timestamp: tx.timestamp,
		numberOfConfirmation: tx.number_of_confirmation,
		operationStartDate: tx.operation_start_date || tx.timestamp,
		bitcoinExplorerUrl: tx.bitcoin_explorer_url,
		suiExplorerUrl: tx.sui_explorer_url,
		fees: tx.fees || 5,
		errorMessage: tx.error_message,
	};
}

export class IndexerClient {
	private baseUrl: string;

	constructor(baseUrl: string = INDEXER_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	/**
	 * Fetch nBTC transactions for a specific Sui recipient address
	 */
	async fetchNbtcTransactions(suiRecipient: string): Promise<MintTransaction[]> {
		try {
			const url = `${this.baseUrl}?sui_recipient=${encodeURIComponent(suiRecipient)}`;
			console.log("Fetching nBTC transactions from:", url);

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: unknown = await response.json();
			console.log("Indexer response:", data);

			// Handle different response formats
			if (typeof data === "object" && data !== null && "error" in data) {
				console.error("Indexer error:", (data as { error: string }).error);
				return [];
			}

			// If data has transactions array, use it
			if (typeof data === "object" && data !== null && "transactions" in data) {
				const responseData = data as { transactions: IndexerTransaction[] };
				if (Array.isArray(responseData.transactions)) {
					return responseData.transactions.map(convertIndexerTransaction);
				}
			}

			// If data is directly an array, use it
			if (Array.isArray(data)) {
				return (data as IndexerTransaction[]).map(convertIndexerTransaction);
			}

			// If no transactions found, return empty array
			console.log("No transactions found in response");
			return [];
		} catch (error) {
			console.error("Error fetching nBTC transactions:", error);
			// Return empty array on error rather than throwing
			return [];
		}
	}

	/**
	 * Fetch a specific transaction by Bitcoin TX ID
	 */
	async fetchTransaction(bitcoinTxId: string): Promise<MintTransaction | null> {
		try {
			const url = `${this.baseUrl}/nbtc/tx/${encodeURIComponent(bitcoinTxId)}`;
			console.log("Fetching specific transaction from:", url);

			const response = await fetch(url);

			if (!response.ok) {
				if (response.status === 404) {
					return null; // Transaction not found
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const tx: IndexerTransaction = await response.json();
			return convertIndexerTransaction(tx);
		} catch (error) {
			console.error("Error fetching transaction:", error);
			return null;
		}
	}
}

// Export a default instance
export const indexerClient = new IndexerClient();

// Helper function to determine refresh interval based on transaction status
export function getRefreshInterval(status: NbtcTxStatus): number {
	switch (status) {
		case "confirming":
			return 30000; // 30 seconds for confirming transactions
		case "finalized":
		case "minted":
			return 1000; // 1 second for minting/finalized transactions
		case "failed":
		case "reorg":
			return 0; // No refresh for failed transactions
		default:
			return 30000; // Default 30 seconds
	}
}

// Helper function to check if any transaction needs frequent refresh
export function shouldRefreshFrequently(transactions: MintTransaction[]): boolean {
	return transactions.some(
		(tx) => tx.status === "finalized" || tx.status === "confirming" || tx.status === "minted",
	);
}
