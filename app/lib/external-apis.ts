import { BitcoinNetworkType } from "sats-connect";
import { getBitcoinNetworkConfig } from "~/hooks/useBitcoinConfig";
import { type MintTransaction, type MintingTxStatus, MintingStatus } from "~/server/Mint/types";

// Raw mempool/bitcoin API UTXO shape
type ExternalUTXO = {
	scriptpubkey: string;
	txid: string;
	value: number;
	vout: number;
};

// Normalized UTXO shape used by the app
export type UTXO = {
	scriptPubKey: string;
	txid: string;
	value: number;
	vout: number;
};

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

// Utils
function mapIndexerStatus(status: string): MintingTxStatus {
	switch (status.toLowerCase()) {
		case "confirming":
			return MintingStatus.Confirming;
		case "finalized":
			return MintingStatus.Finalized;
		case "minted":
			return MintingStatus.Minted;
		case "failed":
			return MintingStatus.Failed;
		case "reorg":
			return MintingStatus.Reorg;
		default:
			return MintingStatus.Unknown;
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

export async function fetchUTXOs(
	address: string,
	network: BitcoinNetworkType = BitcoinNetworkType.Testnet4,
): Promise<UTXO[]> {
	try {
		if (network === BitcoinNetworkType.Regtest) {
			const res = await fetch(
				`/api/proxy?service=bitcoin&action=utxos&address=${encodeURIComponent(address)}`,
			);
			if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
			const data = await res.json();
			return (data as ExternalUTXO[]).map((utxo: ExternalUTXO) => ({
				txid: utxo.txid,
				vout: utxo.vout,
				value: utxo.value,
				scriptPubKey: utxo.scriptpubkey,
			}));
		}

		const networkConfig = getBitcoinNetworkConfig[network];
		const variables = networkConfig?.variables;

		if (!variables || !variables.mempoolApiUrl) {
			throw new Error(`Mempool API URL not configured for network: ${network}`);
		}

		const res = await fetch(`${variables.mempoolApiUrl}/address/${address}/utxo`);
		if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
		const data = await res.json();
		return (data as ExternalUTXO[]).map((utxo: ExternalUTXO) => ({
			txid: utxo.txid,
			vout: utxo.vout,
			value: utxo.value,
			scriptPubKey: utxo.scriptpubkey,
		}));
	} catch (error) {
		console.error("Failed to fetch UTXOs:", error);
		throw new Error(`Failed to fetch UTXOs for address ${address}`);
	}
}

// fetchRecommendedFeeRate removed (not used)

export async function fetchNbtcTransactions(
	suiRecipient: string,
	network?: string,
): Promise<MintTransaction[]> {
	try {
		let url = `/api/proxy?service=indexer&sui_recipient=${encodeURIComponent(suiRecipient)}`;
		if (network) {
			url += `&network=${encodeURIComponent(network)}`;
		}

		const response = await fetch(url);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Error fetching nBTC transactions:", errorText);
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

		return [];
	} catch (error) {
		console.error("Error fetching nBTC transactions:", error);
		return [];
	}
}

export async function fetchTransaction(bitcoinTxId: string): Promise<MintTransaction | null> {
	try {
		const url = `/api/proxy?service=indexer&bitcoin_tx_id=${encodeURIComponent(bitcoinTxId)}`;
		const response = await fetch(url);

		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const tx: IndexerTransaction = await response.json();
		return convertIndexerTransaction(tx);
	} catch (error) {
		console.error("Error fetching transaction:", error);
		return null;
	}
}
