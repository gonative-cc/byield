import { ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { ReserveCard } from "~/components/ui/ReserveCard";
import { TabContent, TabHeader } from "~/components/ui/TabContent";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { formatBTC, formatNBTC } from "~/lib/denoms";
import { useNetworkVariables } from "~/networkConfig";
import {
	makeReq,
	type QueryLockedNCBTCResp,
	type QueryLockedNBTCResp,
} from "~/server/reserve-dashboard/jsonrpc";

function Header() {
	return (
		<>
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
						<ShieldCheck />
					</div>
					<div>
						<h1 className="text-xl font-bold">Native Proof of Reserves</h1>
						<div className="text-base-content/70 flex items-center gap-2 text-sm">
							<span>STATUS: Fully backed</span>
						</div>
					</div>
				</div>
			</div>
			<span className="text-base-content/70 flex items-center gap-2 text-sm">
				Transparent by design: 1:1 BTC backing, verify reserves on-chain by clicking wallet addresses.
			</span>
		</>
	);
}

function NBTCReserveTabContent() {
	const {
		nbtc: { pkgId, contractId },
	} = useNetworkVariables();
	const { network } = useXverseWallet();
	const { graphqlURl } = useNetworkVariables();
	const lockedBTCFetcher = useFetcher<QueryLockedNBTCResp>();
	const lockedBTCData: QueryLockedNBTCResp = lockedBTCFetcher.data ?? null;

	useEffect(() => {
		if (lockedBTCFetcher.state === "idle" && !lockedBTCData) {
			makeReq<QueryLockedNBTCResp>(lockedBTCFetcher, {
				method: "queryLockedNBTC",
				params: [network, graphqlURl, contractId],
			});
		}
	}, [lockedBTCData, lockedBTCFetcher, network, contractId, graphqlURl]);

	const totalLockedBTC = lockedBTCFetcher.data?.totalLockedBTC;
	const totalNBTCSupply = lockedBTCFetcher.data?.totalNBTCSupply || 0;
	const isPageLoading = lockedBTCFetcher.state !== "idle";

	return (
		<TabContent>
			<ReserveCard
				title="Total BTC Locked (Reserves)"
				value={formatBTC(BigInt(totalLockedBTC || 0))}
				unit="BTC"
				isLoading={isPageLoading}
				addressLabel="Address"
				address={pkgId}
			/>
			<ReserveCard
				title="Total nBTC Minted (Liability)"
				value={formatNBTC(totalNBTCSupply)}
				unit="nBTC"
				isLoading={isPageLoading}
				addressLabel="Contract"
				address={pkgId}
			/>
		</TabContent>
	);
}

function NCBTCReserveTabContent() {
	const { network } = useXverseWallet();
	const { graphqlURl } = useNetworkVariables();
	const lockedCNBTCFetcher = useFetcher<QueryLockedNCBTCResp>();
	const lockedBTCData: QueryLockedNCBTCResp = lockedCNBTCFetcher.data ?? null;

	useEffect(() => {
		if (lockedCNBTCFetcher.state === "idle" && !lockedBTCData) {
			makeReq<QueryLockedNCBTCResp>(lockedCNBTCFetcher, {
				method: "queryLockedNCBTC",
				params: [network, graphqlURl],
			});
		}
	}, [graphqlURl, lockedBTCData, lockedCNBTCFetcher, network]);

	const totalLockedBTC = lockedCNBTCFetcher.data?.totalLockedBTC;
	const totalLockedNCBTC = lockedCNBTCFetcher.data?.totalNCBTCSupply;
	const NCBTCData = lockedCNBTCFetcher.data?.NCBTCData || [];
	const isPageLoading = lockedCNBTCFetcher.state !== "idle";

	return (
		<TabContent>
			<ReserveCard
				title="Total BTC Locked (Reserves)"
				value={formatBTC(BigInt(totalLockedBTC || 0))}
				unit="BTC"
				isLoading={isPageLoading}
				tableData={NCBTCData.map((item) => ({
					name: item.name,
					address: item.btc_addr,
					amount: formatBTC(item.amount),
					unit: "BTC",
				}))}
			/>

			<ReserveCard
				title="Total ncBTC"
				value={formatNBTC(totalLockedNCBTC || 0)}
				unit="ncBTC"
				isLoading={isPageLoading}
				tableData={NCBTCData?.map((item) => ({
					name: item.name,
					address: item.cbtc_pkg,
					amount: formatNBTC(item.totalSupply),
					unit: "ncBTC",
				}))}
			/>
		</TabContent>
	);
}

export const ReserveDashboard = () => {
	return (
		<div className="mx-auto space-y-6 p-6 sm:p-8">
			<Header />
			<div className="tabs tabs-boxed rounded-full p-1">
				<TabHeader title="nBTC" checked={true} />
				<NBTCReserveTabContent />
				<TabHeader title="ncBTC" />
				<NCBTCReserveTabContent />
			</div>
		</div>
	);
};
