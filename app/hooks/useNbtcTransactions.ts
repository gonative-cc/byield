import { useState, useEffect, useCallback, useContext } from "react";
import { type MintTransaction } from "~/server/Mint/types";
import { indexerClient, getRefreshInterval, shouldRefreshFrequently } from "~/lib/indexer.client";
import { WalletContext } from "~/providers/ByieldWalletProvider";

interface UseNbtcTransactionsResult {
	transactions: MintTransaction[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export function useNbtcTransactions(): UseNbtcTransactionsResult {
	const [transactions, setTransactions] = useState<MintTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { suiAddr } = useContext(WalletContext);

	const fetchTransactions = useCallback(async () => {
		if (!suiAddr) {
			setTransactions([]);
			setIsLoading(false);
			setError(null);
			return;
		}

		try {
			setError(null);
			console.log("Fetching nBTC transactions for address:", suiAddr);

			const fetchedTransactions = await indexerClient.fetchNbtcTransactions(suiAddr);
			console.log("Fetched transactions:", fetchedTransactions);

			setTransactions(fetchedTransactions);
		} catch (err) {
			console.error("Error fetching nBTC transactions:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch transactions");
		} finally {
			setIsLoading(false);
		}
	}, [suiAddr]);

	// Initial fetch when suiAddr changes
	useEffect(() => {
		setIsLoading(true);
		fetchTransactions();
	}, [fetchTransactions]);

	// Auto-refresh based on transaction status
	useEffect(() => {
		if (!suiAddr || transactions.length === 0) {
			return;
		}

		// Determine if we need frequent refresh
		const needsFrequentRefresh = shouldRefreshFrequently(transactions);

		if (!needsFrequentRefresh) {
			return; // No auto-refresh needed
		}

		// Get the shortest refresh interval from all active transactions
		const refreshInterval = Math.min(
			...transactions
				.filter(
					(tx) =>
						tx.status === "confirming" ||
						tx.status === "finalized" ||
						tx.status === "minted",
				)
				.map((tx) => getRefreshInterval(tx.status)),
		);

		console.log(`Setting up auto-refresh every ${refreshInterval}ms`);

		const intervalId = setInterval(() => {
			console.log("Auto-refreshing nBTC transactions...");
			fetchTransactions();
		}, refreshInterval);

		return () => {
			console.log("Clearing auto-refresh interval");
			clearInterval(intervalId);
		};
	}, [transactions, suiAddr, fetchTransactions]);

	return {
		transactions,
		isLoading,
		error,
		refetch: fetchTransactions,
	};
}
