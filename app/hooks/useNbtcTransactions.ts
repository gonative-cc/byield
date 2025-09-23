import { useState, useEffect, useCallback, useContext } from "react";
import { type MintTransaction, MintingStatus } from "~/server/Mint/types";
import { fetchNbtcTransactions } from "~/lib/external-apis";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";

interface UseNbtcTxsResult {
	txs: MintTransaction[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
	addPendingTx: (txId: string, amountInSatoshi: number, suiAddress: string) => void;
}

export function useNbtcTxs(): UseNbtcTxsResult {
	const [transactions, setTransactions] = useState<MintTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { suiAddr } = useContext(WalletContext);
	const { network } = useXverseWallet();

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
			const fetchedTransactions = await fetchNbtcTransactions(suiAddr, network);

			const mergedTxs = [...fetchedTransactions];
			const pendingTxs: string[] = [];

			transactions.forEach((pendingTx) => {
				const exists = fetchedTransactions.some(
					(fetchedTx) => fetchedTx.bitcoinTxId === pendingTx.bitcoinTxId,
				);
				if (!exists) {
					mergedTxs.push(pendingTx);
					pendingTxs.push(pendingTx.bitcoinTxId);
				}
			});

			const sortedTxs = mergedTxs.sort(
				(a, b) =>
					(b.operationStartDate || b.timestamp) - (a.operationStartDate || a.timestamp),
			);

			setTransactions(sortedTxs);
		} catch (err) {
			console.error("Error fetching nBTC transactions:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch transactions");
		} finally {
			setIsLoading(false);
		}
	}, [suiAddr, network]);

	const addPendingTx = useCallback(
		(txId: string, amountInSatoshi: number, suiAddress: string) => {
			const pendingTx: MintTransaction = {
				bitcoinTxId: txId,
				amountInSatoshi: amountInSatoshi,
				status: MintingStatus.Broadcasting,
				suiAddress: suiAddress,
				timestamp: Date.now(),
				numberOfConfirmation: 0,
				operationStartDate: Date.now(),
				bitcoinExplorerUrl: undefined,
				fees: 1000,
			};

			setTransactions((prev) => {
				const exists = prev.some((tx) => tx.bitcoinTxId === txId);
				if (exists) return prev;
				return [pendingTx, ...prev];
			});
		},
		[network, fetchTransactions],
	);

	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	useEffect(() => {
		if (!suiAddr) return;

		// Unified polling: refresh every 2 minutes for all networks
		const interval = setInterval(fetchTransactions, 120000);
		return () => clearInterval(interval);
	}, [transactions, suiAddr, network, fetchTransactions]);

	return {
		txs: transactions,
		isLoading,
		error,
		refetch: fetchTransactions,
		addPendingTx,
	};
}
