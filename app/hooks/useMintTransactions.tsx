import { useState, useEffect, useCallback, useContext } from "react";
import type { MintTransaction } from "~/server/Mint/types";
import { fetchMintTransactions } from "~/lib/indexer";
import { useBitcoinConfig, type BitcoinConfigBase } from "./useBitcoinConfig";
import { WalletContext } from "~/providers/ByieldWalletProvider";

interface UseMintTransactionsResult {
	transactions: MintTransaction[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

/**
 * Hook to fetch and manage mint transactions from the indexer
 * Polls every 15 seconds for real-time updates
 *
 * Note: Indexer only tracks transactions after they're broadcast and detected.
 * Transaction flow: Broadcasting (local) → Confirming (indexer) → Finalized → Minted
 */
export function useMintTransactions(): UseMintTransactionsResult {
	const [transactions, setTransactions] = useState<MintTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const bitcoinConfig = useBitcoinConfig();
	const { suiAddr } = useContext(WalletContext);

	const indexerUrl = (bitcoinConfig as BitcoinConfigBase)?.nBTC?.indexerUrl;

	const fetchData = useCallback(async () => {
		console.log("🔍 Bitcoin config:", bitcoinConfig);
		console.log("🔍 Indexer URL:", indexerUrl);
		console.log("🔍 Full nBTC config:", bitcoinConfig?.nBTC);

		if (!indexerUrl) {
			console.log("⚠️ No indexer URL configured for current network");
			setTransactions([]);
			setIsLoading(false);
			return;
		}

		try {
			setError(null);
			console.log("🔄 Fetching mint transactions...", { indexerUrl, suiAddr });

			const data = await fetchMintTransactions(indexerUrl, suiAddr || undefined);
			setTransactions(data);

			console.log(`✅ Successfully fetched ${data.length} mint transactions`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to fetch transactions";

			// Don't spam console with CORS errors in development
			if (errorMessage.includes("CORS error")) {
				console.warn("🚧 CORS error (expected in development)");
			} else {
				console.error("❌ Error fetching mint transactions:", errorMessage);
			}

			setError(errorMessage);

			// On error, keep showing previous data if available
			if (transactions.length === 0) {
				setTransactions([]);
			}
		} finally {
			setIsLoading(false);
		}
	}, [indexerUrl, suiAddr, transactions.length, bitcoinConfig]);

	// Initial fetch
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Set up polling every 15 seconds for real-time updates
	useEffect(() => {
		if (!indexerUrl) return;

		const interval = setInterval(() => {
			console.log("🔄 Polling for transaction updates...");
			fetchData();
		}, 15000); // 15 seconds

		return () => clearInterval(interval);
	}, [indexerUrl, fetchData]);

	const refetch = useCallback(() => {
		setIsLoading(true);
		fetchData();
	}, [fetchData]);

	return {
		transactions,
		isLoading,
		error,
		refetch,
	};
}
