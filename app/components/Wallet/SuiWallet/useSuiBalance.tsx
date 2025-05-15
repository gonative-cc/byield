import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import type { CoinBalance } from "@mysten/sui/client";

// unfortunately, SUI doesn't have their own hook to get the balance at the moment
// useSuiBalance fetches the SUI balance in mist
export const useSuiBalance = () => {
	const suiClient = useSuiClient();
	const account = useCurrentAccount();
	const queryClient = useQueryClient();

	const fetchBalance = async (): Promise<CoinBalance | null> => {
		if (!account) {
			return null;
		}
		return await suiClient.getBalance({
			owner: account.address,
		});
	};

	const queryKey = ["suiBalance", account?.address];

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
