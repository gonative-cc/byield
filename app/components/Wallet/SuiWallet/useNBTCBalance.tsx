import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import type { CoinBalance } from "@mysten/sui/client";

const endsWithNBTC = (input: string): boolean => {
	const regex = /NBTC$/;
	return regex.test(input);
};

export const useNBTCBalance = () => {
	const suiClient = useSuiClient();
	const account = useCurrentAccount();
	const queryClient = useQueryClient();

	const fetchBalance = async (): Promise<CoinBalance | undefined> => {
		if (!account) {
			return undefined;
		}
		const coins = await suiClient.getAllBalances({
			owner: account.address,
		});

		const nbtcCoin = coins.find((coin) => endsWithNBTC(coin.coinType));
		return nbtcCoin;
	};

	const queryKey = ["nBTCBalance", account?.address];

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
