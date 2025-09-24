import { RegtestInstructions } from "~/pages/Mint/RegtestInstructions";
import { MintBTC } from "~/pages/Mint/MintBTC";
import { MintBTCTable } from "~/pages/Mint/MintBTCTable";
import { Collapse } from "~/components/ui/collapse";
import { RefreshCw } from "lucide-react";
import type { Route } from "./+types/mint";
import Controller from "~/server/Mint/controller.server";
import { useFetcher } from "react-router";
import { makeReq, type QueryMintTxResp } from "~/server/Mint/jsonrpc";
import { useContext, useEffect, useRef, useCallback } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { BlockInfoCard } from "~/components/ui/BlockInfoCard";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";

// This is a server mint to post data to server (data mutations)
export async function action({ request }: Route.ActionArgs) {
	const ctrl = new Controller();
	return ctrl.handleJsonRPC(request);
}

export default function Mint() {
	const { network } = useXverseWallet();
	const { suiAddr } = useContext(WalletContext);
	const mintTxFetcher = useFetcher<QueryMintTxResp>();
	const prevSuiAddrRef = useRef<string | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const mintTxs = mintTxFetcher.data ?? null;
	const isLoading = mintTxFetcher.state !== "idle";
	const hasError = mintTxFetcher.state === "idle" && mintTxFetcher.data === undefined && suiAddr;
	const error = hasError ? "Failed to load transactions" : null;

	// Function to fetch mint transactions
	const fetchMintTxs = useCallback(() => {
		if (suiAddr) {
			makeReq<QueryMintTxResp>(mintTxFetcher, { method: "queryMintTx", params: [network, suiAddr] });
		}
	}, [suiAddr, mintTxFetcher, network]);

	// Refetch when suiAddr changes
	useEffect(() => {
		if (prevSuiAddrRef.current !== suiAddr) {
			prevSuiAddrRef.current = suiAddr;
			if (suiAddr) {
				fetchMintTxs();
			}
		}
	}, [suiAddr, fetchMintTxs]);

	// Set up 2-minute interval for automatic refetching
	useEffect(() => {
		// Clear existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Set up new interval if suiAddr exists
		if (suiAddr) {
			intervalRef.current = setInterval(() => {
				fetchMintTxs();
			}, 120000); // 2 minutes = 120,000ms
		}

		// Cleanup interval on unmount or when suiAddr changes
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [suiAddr, fetchMintTxs]);

	// Initial fetch when component mounts and suiAddr is available
	useEffect(() => {
		if (mintTxFetcher.state === "idle" && suiAddr && !mintTxs) {
			fetchMintTxs();
		}
		// reset fetcher on wallet disconnect
		if (suiAddr === null) {
			mintTxFetcher.submit(null);
		}
	}, [mintTxFetcher.state, suiAddr, mintTxs, fetchMintTxs, mintTxFetcher]);

	return (
		<div className="mx-auto px-4 py-4 space-y-6">
			<div className="text-center space-y-4">
				<div className="space-y-2">
					<span className="text-4xl">
						Mint<span className="text-primary"> nBTC</span>
					</span>
					<p className="text-muted-foreground text-lg">
						Deposit Bitcoin and mint native Bitcoin tokens on Sui network
					</p>
				</div>
			</div>

			<div className="flex justify-center">
				<div className="w-full max-w-xl space-y-6">
					<Collapse title="Regtest Configuration for Devnet Server" className="bg-base-200">
						<RegtestInstructions />
					</Collapse>
					<BlockInfoCard />
					<MintBTC />
				</div>
			</div>

			{/* Transaction Table Section */}
			{suiAddr && (
				<div className="space-y-4">
					<div className="flex justify-end">
						<button
							onClick={fetchMintTxs}
							disabled={isLoading}
							className="btn btn-sm btn-ghost flex items-center gap-2 hover:bg-base-200"
							title="Refresh transactions"
						>
							<RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
							Refresh
						</button>
					</div>

					{error && (
						<div className="alert">
							<div>
								<div className="font-medium">Failed to load transactions</div>
								<div className="text-sm opacity-80">{error}</div>
								<button onClick={fetchMintTxs} className="btn btn-sm mt-2">
									Retry
								</button>
							</div>
						</div>
					)}
					<MintBTCTable data={mintTxs || []} isLoading={isLoading} />
				</div>
			)}
		</div>
	);
}
