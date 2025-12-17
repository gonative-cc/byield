import { useSuiClient, useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { useNetworkVariables } from "~/networkConfig";

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

	const resolvedCoinAddr =
		!coinOrVariant || coinOrVariant === "SUI"
			? "0x2::sui::SUI"
			: coinOrVariant === "NBTC"
				? nbtc.pkgId + nbtc.coinType
				: coinOrVariant;

	const {
		data: balance,
		error,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["coinBalance", userAddr, network, resolvedCoinAddr],
		queryFn: () => {
			console.log(">>>>>> querying balance", resolvedCoinAddr);
			return suiClient.getBalance({ owner: userAddr!, coinType: resolvedCoinAddr });
		},
		enabled: !!userAddr,
		// cache the balance for 10 min
		// staleTime: 600000,
	});

	return {
		balance: balance ? BigInt(balance.totalBalance) : 0n,
		isLoading,
		error,
		refetch,
	};
}
