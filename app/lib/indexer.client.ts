import { type MintTransaction, type NbtcTxStatus } from "~/server/Mint/types";

const INDEXER_BASE_URL = "/api/indexer";

interface IndexerTransaction {
	btc_tx_id: string;
	amount_sats: number;
	status: string;
	sui_recipient: string;
	sui_tx_id?: string;
	created_at: number;
	updated_at: number;
	confirmations: number;
	block_hash: string;
	block_height: number;
	tx_id: string;
	vout: number;
	bitcoin_explorer_url?: string;
	sui_explorer_url?: string;
	fees?: number;
	error_message?: string;
}

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

function convertIndexerTransaction(tx: IndexerTransaction): MintTransaction {
	return {
		bitcoinTxId: tx.btc_tx_id,
		amountInSatoshi: tx.amount_sats,
		status: mapIndexerStatus(tx.status),
		suiAddress: tx.sui_recipient,
		suiTxId: tx.sui_tx_id,
		timestamp: tx.created_at,
		numberOfConfirmation: tx.confirmations,
		operationStartDate: tx.created_at,
		bitcoinExplorerUrl: tx.bitcoin_explorer_url,
		suiExplorerUrl: tx.sui_explorer_url,
		fees: tx.fees || 1000,
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
	async fetchNbtcTransactions(
		suiRecipient: string,
		network?: string,
	): Promise<MintTransaction[]> {
		try {
			let url = `${this.baseUrl}?sui_recipient=${encodeURIComponent(suiRecipient)}`;
			if (network) {
				url += `&network=${encodeURIComponent(network)}`;
			}
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: unknown = await response.json();

			if (typeof data === "object" && data !== null && "error" in data) {
				console.error("Indexer error:", (data as { error: string }).error);
				return [];
			}

			if (typeof data === "object" && data !== null && "transactions" in data) {
				const responseData = data as { transactions: IndexerTransaction[] };
				if (Array.isArray(responseData.transactions)) {
					return responseData.transactions.map(convertIndexerTransaction);
				}
			}

			if (Array.isArray(data)) {
				return (data as IndexerTransaction[]).map(convertIndexerTransaction);
			}

			console.log("No transactions found in response");
			return [];
		} catch (error) {
			console.error("Error fetching nBTC transactions:", error);
			return [];
		}
	}

	/**
	 * Fetch a specific transaction by Bitcoin TX ID and network
	 */
	async fetchTransaction(bitcoinTxId: string): Promise<MintTransaction | null> {
		try {
			const url = `${this.baseUrl}?bitcoin_tx_id=${encodeURIComponent(bitcoinTxId)}`;
			console.log("Fetching specific transaction from:", url);

			const response = await fetch(url);

			if (!response.ok) {
				if (response.status === 404) {
					return null;
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

export const indexerClient = new IndexerClient();

export function getRefreshInterval(status: NbtcTxStatus): number {
	switch (status) {
		case "confirming":
			return 60000;
		case "finalized":
		case "minted":
			return 60000;
		case "failed":
		case "reorg":
			return 0;
		default:
			return 60000;
	}
}

export function shouldRefreshFrequently(transactions: MintTransaction[]): boolean {
	return transactions.some(
		(tx) => tx.status === "finalized" || tx.status === "confirming" || tx.status === "minted",
	);
}
