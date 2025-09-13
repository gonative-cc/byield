import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useState, useEffect, useCallback } from "react";
import { type CoinBalance } from "@mysten/sui/client";

export interface UseCoinBalanceResult {
	balance: bigint;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

// Coin address is a coin package ID followed by the type. Default to 0x2::sui::SUI.
export function useCoinBalance(coinAddr?: string): UseCoinBalanceResult {
	const suiClient = useSuiClient();
	const account = useCurrentAccount();

	const [balance, setBalance] = useState<CoinBalance | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	// Keep the fetching logic simple and reusable
	const fetchBalance = useCallback(
		async (owner: string, coin: string | undefined) => {
			setIsLoading(true);
			setError(null);

			let cancelled = false;
			try {
				const result = await suiClient.getBalance({ owner, coinType: coin });
				if (!cancelled) {
					setBalance(result);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error("Failed to fetch balance: " + err));
					setBalance(null);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}

			return () => {
				cancelled = true;
			};
		},
		[suiClient],
	);

	useEffect(() => {
		if (!account?.address) {
			setBalance(null);
			setIsLoading(false);
			setError(null);
			return;
		}

		// Keep the log for visibility
		console.log("Call fetch balance", account.address);

		const cleanup = fetchBalance(account.address, coinAddr);
		return typeof cleanup === "function" ? cleanup : undefined;
	}, [account?.address, coinAddr, fetchBalance]);

	return {
		balance: balance === null ? 0n : BigInt(balance.totalBalance),
		isLoading,
		error,
		refetch: () => {
			if (account?.address) {
				fetchBalance(account.address, coinAddr);
			}
		},
	};
}
