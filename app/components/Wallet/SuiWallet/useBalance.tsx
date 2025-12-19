import { useSuiClient, useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import type { CoinBalance } from "@mysten/sui/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNetworkVariables } from "~/networkConfig";
import type { BalanceChange } from "@mysten/sui/client";

export interface UseCoinBalanceResult {
	balance: bigint;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

export function useCoinBalance(coinOrVariant?: string) {
	const suiClient = useSuiClient();
	const account = useCurrentAccount();
	const userAddr = account?.address || null;
	const { nbtc } = useNetworkVariables();
	const { network } = useSuiClientContext();
	const queryClient = useQueryClient();

	const resolvedCoinAddr =
		coinOrVariant === undefined || coinOrVariant === "SUI"
			? undefined
			: coinOrVariant === "NBTC"
				? nbtc.pkgId + nbtc.coinType
				: coinOrVariant;

	const coinCacheKey = ["coinBalance", userAddr, network, coinOrVariant || "SUI"];

	const {
		data: balance,
		error,
		isLoading,
		refetch,
	} = useQuery<CoinBalance>({
		queryKey: coinCacheKey,
		queryFn: () => suiClient.getBalance({ owner: userAddr!, coinType: resolvedCoinAddr }),
		enabled: !!userAddr,
		// cache the balance for 10 min
		staleTime: 600000,
	});

	const updateCoinBalanceInCache = (newBalance: string) => {
		queryClient.setQueryData(coinCacheKey, (oldData: CoinBalance) => ({
			...oldData,
			totalBalance: newBalance,
		}));
	};

	return {
		balance: balance ? BigInt(balance.totalBalance) : 0n,
		coinType: balance?.coinType,
		isLoading,
		error,
		refetch,
		updateCoinBalanceInCache,
	};
}

/**
 * Observes a list of balance changes and updates the cache for any corresponding
 * coins found in the provided configuration list.

 *
 * @param balanceChanges - An array of balance change events containing the coin type and the amount changed.
 * @param coins - An array of coin objects, that user wish to update in the cache if corresponding coin balance changed.
 */
export function handleBalanceChanges(
	balanceChanges: BalanceChange[],
	coins: {
		coinType: string;
		currentBalance: bigint;
		updateCoinBalanceInCache: (newBalance: string) => void;
	}[],
) {
	for (const balanceChange of balanceChanges) {
		const coin = coins.find((c) => c.coinType === balanceChange.coinType);
		if (coin) {
			const newBalance = String(coin.currentBalance + BigInt(balanceChange.amount));
			if (newBalance !== String(coin.currentBalance)) {
				coin.updateCoinBalanceInCache(newBalance);
			}
		}
	}
}
