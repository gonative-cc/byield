import { useCurrentAccount } from "@mysten/dapp-kit";
import { ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { ReserveCard } from "~/components/ui/ReserveCard";
import { TabContent, TabHeader } from "~/components/ui/TabContent";
import { SuiConnectModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { useNBTCTotalSupply } from "~/hooks/useNBTCTotalSupply";
import { useNetworkVariables } from "~/networkConfig";
import { makeReq, type QueryLockedBTCResp } from "~/server/reserve-dashboard/jsonrpc";

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

export const ReserveDashboard = () => {
	const currentAccount = useCurrentAccount();
	const suiAddr = currentAccount?.address || null;
	const { totalSupply: totalMintedNBTC, isLoading } = useNBTCTotalSupply();
	const {
		nbtc: { pkgId },
	} = useNetworkVariables();

	const { network } = useXverseWallet();
	const lockedBTCFetcher = useFetcher<QueryLockedBTCResp>();
	const lockedBTCData: QueryLockedBTCResp = lockedBTCFetcher.data ?? null;

	useEffect(() => {
		if (lockedBTCFetcher.state === "idle" && !lockedBTCData) {
			makeReq<QueryLockedBTCResp>(lockedBTCFetcher, { method: "queryLockedBTC", params: [network] });
		}
	}, [lockedBTCData, lockedBTCFetcher, network]);

	const totalLockedBTC = lockedBTCFetcher.data?.totalLockedBTC;
	const CBTCData = lockedBTCFetcher.data?.CBTCData;
	const isPageLoading = lockedBTCFetcher.state !== "idle" || isLoading;

	return (
		<div className="mx-auto space-y-6 p-6 sm:p-8">
			<Header />
			<div className="tabs tabs-boxed rounded-full p-1">
				<TabHeader title="nBTC" checked={true} />
				<TabContent>
					<ReserveCard
						title="Total BTC Locked (Reserves)"
						value={totalLockedBTC || 0}
						unit="BTC"
						isLoading={isPageLoading}
						addressLabel="Address"
						address={pkgId}
					/>

					<ReserveCard
						title="Total nBTC Minted (Liability)"
						value={totalMintedNBTC || 0}
						unit="nBTC"
						isLoading={isPageLoading}
						addressLabel="Contract"
						address={pkgId}
					>
						{!suiAddr && <SuiConnectModal />}
					</ReserveCard>
				</TabContent>

				<TabHeader title="ncBTC" />
				<TabContent>
					<ReserveCard
						title="Total BTC Locked (Reserves)"
						value={totalLockedBTC || 0}
						unit="BTC"
						isLoading={isPageLoading}
						tableData={CBTCData?.map((item) => ({
							name: item.name,
							address: item.btc_addr,
							amount: 1.25271058,
							unit: "BTC",
						}))}
					/>

					<ReserveCard
						title="Total ncBTC"
						value={totalMintedNBTC || 0}
						unit="ncBTC"
						isLoading={isPageLoading}
						tableData={CBTCData?.map((item) => ({
							name: item.name,
							address: item.cbtc_pkg,
							amount: 1.25271058,
							unit: "ncBTC",
						}))}
					/>
				</TabContent>
			</div>
		</div>
	);
};
