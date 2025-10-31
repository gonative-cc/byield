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
		coinOrVariant === undefined || coinOrVariant === "SUI"
			? undefined
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
		queryFn: () => suiClient.getBalance({ owner: userAddr!, coinType: resolvedCoinAddr }),
		enabled: !!userAddr,
	});

	return {
		balance: balance ? BigInt(balance.totalBalance) : 0n,
		isLoading,
		error,
		refetch,
	};
}
