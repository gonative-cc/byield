import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { useState, useEffect, useCallback } from 'react';
import { SuiClient, type CoinBalance } from '@mysten/sui/client';

export interface UseCoinBalanceResult {
	balance: bigint;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

async function fetchBalance(
	suiClient: SuiClient,
	owner: string,
	coin?: string,
): Promise<CoinBalance | Error> {
	try {
		return suiClient.getBalance({ owner, coinType: coin });
	} catch (err) {
		return err instanceof Error ? err : new Error('Failed to fetch balance: ' + err);
	}
}

// Coin address is a coin package ID followed by the type. Default to 0x2::sui::SUI.
export function useCoinBalance(coinAddr?: string): UseCoinBalanceResult {
	const suiClient = useSuiClient();
	const account = useCurrentAccount();
	const userAddr = account?.address || null;

	const [balance, setBalance] = useState<CoinBalance | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(() => {
		if (userAddr === null) {
			setBalance(null);
			setIsLoading(false);
			setError(null);
			return;
		}

		let cancelled = false;

		console.log(`Fetching coin (${coinAddr}) balance for`, userAddr);
		setIsLoading(true);
		setError(null);

		fetchBalance(suiClient, userAddr, coinAddr).then((resOrErr) => {
			if (cancelled) {
				return;
			}
			setIsLoading(false);
			if (resOrErr instanceof Error) setError(resOrErr);
			else setBalance(resOrErr);
		});

		// cleanup function
		return () => {
			cancelled = true;
		};
	}, [suiClient, coinAddr, userAddr]);

	useEffect(refetch, [refetch]);

	return {
		balance: balance === null ? 0n : BigInt(balance.totalBalance),
		isLoading,
		error,
		refetch,
	};
}
