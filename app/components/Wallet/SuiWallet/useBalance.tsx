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
		isLoading,
		error,
		refetch,
		updateCoinBalanceInCache,
	};
}

// observe balance changes and update the cache for the corresponding coin tpye
export function handleBalanceChanges(
	balanceChanges: BalanceChange[],
	coinType: string,
	currentBalance: bigint,
	updateCoinBalanceInCache: (newBalance: string) => void,
) {
	for (const balanceChange of balanceChanges) {
		if (balanceChange.coinType === coinType) {
			const newBalance = String(currentBalance + BigInt(balanceChange.amount));
			updateCoinBalanceInCache(newBalance);
		}
	}
}
