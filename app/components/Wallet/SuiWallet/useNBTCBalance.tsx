import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import type { CoinBalance } from "@mysten/sui/client";
import { NBTC_COIN_TYPE } from "~/lib/nbtc";

export const useNBTCBalance = () => {
	const suiClient = useSuiClient();
	const account = useCurrentAccount();
	const queryClient = useQueryClient();
	const queryKey = ["nBTCBalance", account?.address];

	const fetchBalance = async (): Promise<CoinBalance | null> => {
		if (!account) {
			return null;
		}
		return await suiClient.getBalance({
			owner: account.address,
			coinType: NBTC_COINT_TYPE,
		});
	};

	const {
		data: balance,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey,
		queryFn: fetchBalance,
		enabled: !!account,
		staleTime: 30_000,
	});

	const refetchBalance = () => {
		queryClient.invalidateQueries({ queryKey });
		refetch();
	};

	return {
		balance,
		isLoading,
		error: error ? (error instanceof Error ? error : new Error("Unknown error")) : null,
		refetchBalance,
	};
};
