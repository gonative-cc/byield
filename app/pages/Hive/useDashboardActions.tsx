import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import {
	makeReq,
	type QueryUserDepositsDataResp,
	type QueryUserTotalDepositDataResp,
} from "~/server/hive/jsonrpc";
import type { DepositTransaction } from "~/server/hive/types";
import { useNetworkVariables } from "~/networkConfig";
import { formatUSDC } from "~/lib/denoms";

export const useDashboardActions = () => {
	const suiAccount = useCurrentAccount();
	const { lockdrop, graphqlURL } = useNetworkVariables();
	const [userTotalDeposit, setUserTotalDeposit] = useState<{
		totalDeposit: string | null;
		isError: boolean;
	}>({
		totalDeposit: null,
		isError: false,
	});
	const isUserDepositError = userTotalDeposit?.isError;

	const userTotalDepositFetcher = useFetcher<QueryUserTotalDepositDataResp>();
	const isUserTotalDepositLoading = userTotalDepositFetcher.state !== "idle";
	const hiveUserDashboardData: QueryUserTotalDepositDataResp = userTotalDepositFetcher.data ?? null;

	const userDepositFetcher = useFetcher<QueryUserDepositsDataResp>();
	const isUserDepositFetcherLoading = userDepositFetcher.state !== "idle";
	const hiveUserDepositData: QueryUserDepositsDataResp = userDepositFetcher.data ?? null;

	const depositTransactions: DepositTransaction[] = hiveUserDepositData?.data ?? [];

	useEffect(() => {
		if (userTotalDepositFetcher.state === "idle" && !hiveUserDashboardData && suiAccount) {
			makeReq<QueryUserTotalDepositDataResp>(userTotalDepositFetcher, {
				method: "queryTotalDeposit",
				params: [graphqlURL, lockdrop.pkgId, suiAccount.address],
			});
			makeReq<QueryUserDepositsDataResp>(userDepositFetcher, {
				method: "queryUserDeposits",
				params: [graphqlURL, lockdrop.lockdropId, suiAccount.address],
			});
		}
	}, [
		hiveUserDashboardData,
		userTotalDepositFetcher,
		suiAccount,
		graphqlURL,
		lockdrop,
		userDepositFetcher,
	]);

	useEffect(() => {
		function updateUserTotalDeposit() {
			if (hiveUserDashboardData?.isError) {
				setUserTotalDeposit({
					totalDeposit: null,
					isError: true,
				});
				return;
			}

			if (hiveUserDashboardData?.data !== undefined && hiveUserDashboardData?.data !== null) {
				setUserTotalDeposit({
					totalDeposit: formatUSDC(hiveUserDashboardData.data),
					isError: false,
				});
			}
		}
		updateUserTotalDeposit();
	}, [hiveUserDashboardData]);

	return {
		isUserTotalDepositLoading,
		depositTransactions,
		isUserDepositFetcherLoading,
		isUserDepositError,
		userTotalDeposit,
		setUserTotalDeposit,
	};
};
