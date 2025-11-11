import { useCurrentAccount } from "@mysten/dapp-kit";
import { Info, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { CopyButton } from "~/components/ui/CopyButton";
import { SuiConnectModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { useNBTCTotalSupply } from "~/hooks/useNBTCTotalSupply";
import { useNetworkVariables } from "~/networkConfig";
import { makeReq, type QueryLockedBTCResp } from "~/server/reserve-dashboard/jsonrpc";

function Loader() {
	return <div className="skeleton h-8 w-40"></div>;
}

function Header() {
	return (
		<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3">
				<div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
					<ShieldCheck />
				</div>
				<div>
					<h1 className="text-xl font-bold">Native nBTC Proof of Reserves</h1>
					<div className="text-base-content/70 flex items-center gap-2 text-sm">
						<span>STATUS: Fully backed</span>
					</div>
				</div>
			</div>
		</div>
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
	const isPageLoading = lockedBTCFetcher.state !== "idle" || isLoading;

	return (
		<div className="mx-auto space-y-6 p-6 sm:p-8">
			<Header />
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div className="card">
					<div className="card-body">
						<p className="text-base-content/60 mb-2 text-sm font-medium tracking-wide uppercase">
							Total BTC Locked (Reserves)
						</p>
						{isPageLoading ? (
							<Loader />
						) : (
							<p className="text-primary text-2xl font-bold sm:text-3xl">
								{totalLockedBTC ?? "N/A"} BTC
							</p>
						)}
						<div className="divider mt-6 pt-4" />
						<p className="text-base-content/75 flex items-center gap-2 text-sm break-all">
							Address: {trimAddress(pkgId)} <CopyButton text={pkgId} />
						</p>
					</div>
				</div>

				{/* Liability Card */}
				<div className="card">
					<div className="card-body">
						<p className="text-base-content/60 mb-2 text-sm font-medium tracking-wide uppercase">
							Total nBTC Minted (Liability)
						</p>
						{isPageLoading ? (
							<Loader />
						) : !suiAddr ? (
							<SuiConnectModal />
						) : (
							<p className="text-primary text-2xl font-bold sm:text-3xl">
								{totalMintedNBTC ?? "N/A"} nBTC
							</p>
						)}
						<div className="divider mt-6 pt-4" />
						<p className="text-base-content/75 flex items-center gap-2 text-sm break-all">
							Contract: {trimAddress(pkgId)} <CopyButton text={pkgId} />
						</p>
					</div>
				</div>
			</div>
			{/* How to Verify Manually */}
			<span className="alert alert-info">
				<Info />
				Verify reserves by querying the Bitcoin dWallet address. Verify liabilities by querying the
				nBTC contract on Sui.
			</span>
		</div>
	);
};
