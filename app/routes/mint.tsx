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
import { FAQ } from "~/components/FAQ";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";

const FAQS = [
	{
		id: "faq-1",
		question: "What is the main purpose of Testnet v2?",
		answer: `The primary focus is to test the end-to-end flow of minting nBTC on the Sui testnet using BTC from our custom Bitcoin devnet. We are focused on security, functionality, and bug hunting.`,
	},
	{
		id: "faq-2",
		question: `What is this "custom Bitcoin network"?`,
		answer: "It's our own devnet where we have full control. It produces a new block every two minutes and has no re-orgs, providing a stable environment for testing the core logic.",
	},
	{
		id: "faq-3",
		question: "What are the key new features in V2?",
		answer: "The single most important feature is minting nBTC directly from BTC using our SPV Proofs.",
	},
	{
		id: "faq-4",
		question: "Will the old way of swapping SUI for nBTC still work?",
		answer: "Yes, both options will be available. You can swap SUI for nBTC, and you can mint nBTC from BTC..",
	},
	{
		id: "faq-5",
		question: "Why do I need to get BTC from you? Is there a faucet?",
		answer: (
			<span className="text-muted-foreground">
				To ensure a controlled testing environment, we are distributing devnet BTC manually. We do not
				have a public faucet for this phase. Please request funds in our{" "}
				<a
					href="https://forms.gle/nxSr94kN4BiVpJpx6"
					target="_blank"
					rel="noreferrer"
					className="link link-primary"
				>
					form.
				</a>
			</span>
		),
	},
	{
		id: "faq-6",
		question: "Which Bitcoin wallet do I need?",
		answer: "You must use the Xverse wallet, as it allows for connection to our custom devnet network.",
	},
	{
		id: "faq-7",
		question: "Which Sui wallet do I need?",
		answer: "Any Sui wallet that we currently support will work. You can also insert a Sui Address manually, without having to connect your Sui Wallet.",
	},
	{
		id: "faq-8",
		question: "Is there a minimum or maximum amount of nBTC I can mint?",
		answer: "No, there are no limits on the amount you can mint in a single transaction.",
	},
	{
		id: "faq-9",
		question: "Can I sell or withdraw my nBTC back to BTC?",
		answer: "Not yet. For now, it’s only one-way for now (Bitcoin -> Sui). The ability to withdraw nBTC back to BTC will be a future update.",
	},
	{
		id: "faq-10",
		question: "How do I report bugs?",
		answer: "Open a ticket in #testnet-v2-feedback using the template; include addresses, txid, steps to reproduce, timestamps, and screenshots.",
	},
	{
		id: "faq-11",
		question: "Is this Testnet V2 Incentivized in any way?",
		answer: "No. This is a targeted technical preview, it’s limited to users and partners that want to help us test it, understand the flow and provide feedback!",
	},
	{
		id: "faq-12",
		question: "What happens after v2?",
		answer: "We’ll publish a findings report, patch critical/high issues, and work towards the Testnet V3, which will have more functionality and focus on user-testing!",
	},
];

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
	const isLoading = mintTxFetcher.state === "loading";
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
					{mintTxs && <MintBTCTable data={mintTxs} isLoading={isLoading} />}
				</div>
			)}
			<div className="flex justify-center">
				<FAQ faqs={FAQS} />
			</div>
		</div>
	);
}
