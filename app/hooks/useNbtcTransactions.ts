import { useState, useEffect, useCallback, useContext } from "react";
import { type MintTransaction } from "~/server/Mint/types";
import { indexerClient, getRefreshInterval, shouldRefreshFrequently } from "~/lib/indexer.client";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";

interface UseNbtcTransactionsResult {
	transactions: MintTransaction[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
	addPendingTransaction: (txId: string, amountInSatoshi: number, suiAddress: string) => void;
}

export function useNbtcTransactions(): UseNbtcTransactionsResult {
	const [transactions, setTransactions] = useState<MintTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { suiAddr } = useContext(WalletContext);
	const { network } = useXverseWallet();

	const addPendingTransaction = useCallback(
		(txId: string, amountInSatoshi: number, suiAddress: string) => {
			const pendingTx: MintTransaction = {
				bitcoinTxId: txId,
				amountInSatoshi: amountInSatoshi,
				status: "confirming",
				suiAddress: suiAddress,
				timestamp: Date.now(),
				numberOfConfirmation: 0,
				operationStartDate: Date.now(),
				bitcoinExplorerUrl: `http://142.93.46.134:3002/tx/${txId}`,
				fees: 1000,
			};

			setTransactions((prev) => {
				const exists = prev.some((tx) => tx.bitcoinTxId === txId);
				if (exists) return prev;

				return [pendingTx, ...prev];
			});
		},
		[],
	);

	const fetchTransactions = useCallback(async () => {
		if (!suiAddr) {
			setTransactions([]);
			setIsLoading(false);
			setError(null);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const fetchedTransactions = await indexerClient.fetchNbtcTransactions(suiAddr, network);

			setTransactions((prev) => {
				const mergedTxs = [...fetchedTransactions];

				prev.forEach((pendingTx) => {
					const exists = fetchedTransactions.some(
						(fetchedTx) => fetchedTx.bitcoinTxId === pendingTx.bitcoinTxId,
					);
					if (!exists) {
						mergedTxs.push(pendingTx);
					}
				});

				return mergedTxs.sort(
					(a, b) =>
						(b.operationStartDate || b.timestamp) -
						(a.operationStartDate || a.timestamp),
				);
			});
		} catch (err) {
			console.error("Error fetching nBTC transactions:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch transactions");
		} finally {
			setIsLoading(false);
		}
	}, [suiAddr, network]);

	useEffect(() => {
		setIsLoading(true);
		fetchTransactions();
	}, [fetchTransactions]);

	useEffect(() => {
		if (!suiAddr || transactions.length === 0) {
			return;
		}

		const isRegtest = network === "Regtest";

		const needsFrequentRefresh = shouldRefreshFrequently(transactions);

		if (!needsFrequentRefresh && !isRegtest) {
			return;
		}

		let refreshInterval: number;

		if (isRegtest) {
			refreshInterval = 15000;
		} else {
			refreshInterval = Math.min(
				...transactions
					.filter(
						(tx) =>
							tx.status === "confirming" ||
							tx.status === "finalized" ||
							tx.status === "minted",
					)
					.map((tx) => getRefreshInterval(tx.status)),
			);
		}

		const intervalId = setInterval(() => {
			fetchTransactions();
		}, refreshInterval);

		return () => {
			clearInterval(intervalId);
		};
	}, [transactions, suiAddr, fetchTransactions, network]);

	return {
		transactions,
		isLoading,
		error,
		refetch: fetchTransactions,
		addPendingTransaction,
	};
}
