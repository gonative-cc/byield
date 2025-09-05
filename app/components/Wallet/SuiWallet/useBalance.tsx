import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useState, useEffect, useCallback } from "react";
import { type CoinBalance } from "@mysten/sui/client";
import { useNetworkVariables } from "~/networkConfig";

export interface UseCoinBalanceResult {
	balance: bigint;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

// coin address default to 0x2::sui::SUI if not specified.
export function useCoinBalance(coinAddr?: string): UseCoinBalanceResult {
	const { nbtcPkgId } = useNetworkVariables();
	const suiClient = useSuiClient();
	const account = useCurrentAccount();

	const [balance, setBalance] = useState<CoinBalance | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	// callback restricts re-creation of the function again if dependency has not changed
	const fetchBalance = useCallback(async () => {
		if (!account?.address) {
			setBalance(null);
			setIsLoading(false);
			setError(null);
			return;
		}
		// TODO: need to optimize this
		console.log("Call fetch balance", account?.address);

		try {
			setIsLoading(true);
			setError(null);

			const result = await suiClient.getBalance({
				owner: account.address,
				coinType: coinAddr || nbtcPkgId,
			});

			setBalance(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to fetch balance: " + err));
			setBalance(null);
		} finally {
			setIsLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account?.address || null, coinAddr, suiClient]);

	useEffect(() => {
		fetchBalance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account?.address || null, fetchBalance]);

	return {
		balance: balance === null ? 0n : BigInt(balance.totalBalance),
		isLoading,
		error,
		refetch: fetchBalance,
	};
}
