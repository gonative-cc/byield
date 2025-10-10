import { RegtestInstructions } from "~/pages/nbtc-mint/RegtestInstructions";
import { MintBTC } from "~/pages/nbtc-mint/MintBTC";
import { MintBTCTable } from "~/pages/nbtc-mint/MintBTCTable";
import { Collapse } from "~/components/ui/collapse";
import { RefreshCw } from "lucide-react";
import type { Route } from "../+types/mint";
import Controller from "~/server/nbtc/controller.server";
import { useFetcher } from "react-router";
import { makeReq, type QueryMintTxResp } from "~/server/nbtc/jsonrpc";
import { useContext, useEffect, useRef, useCallback, useMemo } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { BlockInfoCard } from "~/components/ui/BlockInfoCard";
import { FAQ } from "~/components/FAQ";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { BitcoinNetworkType } from "sats-connect";

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
			<span>
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
		answer: (
			<span>
				Open a ticket or create a post on{" "}
				<a
					href="https://discord.com/channels/1262723650424016946/1388137313527267371"
					target="_blank"
					rel="noopener noreferrer"
					className="link link-primary"
				>
					#general-feedback
				</a>{" "}
				on our discord. Include all relevant details for the bug.
			</span>
		),
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

const validNetworks: BitcoinNetworkType[] = [
	BitcoinNetworkType.Mainnet,
	BitcoinNetworkType.Testnet4,
	BitcoinNetworkType.Regtest,
];

// This is a server mint to post data to server (data mutations)
export async function action({ request }: Route.ActionArgs) {
	const reqData = await request.clone().json();
	const network = (reqData as { params: [BitcoinNetworkType] }).params[0];

	if (!network || !validNetworks.includes(network)) {
		throw new Error("Invalid network type");
	}

	const ctrl = new Controller(network);
	return ctrl.handleJsonRPC(request);
}

export default function Mint() {
	const { network } = useXverseWallet();
	const { suiAddr } = useContext(WalletContext);
	const mintTxFetcher = useFetcher<QueryMintTxResp>({ key: suiAddr || undefined });
	const prevSuiAddrRef = useRef<string | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const mintTxs = useMemo(() => mintTxFetcher.data || [], [mintTxFetcher.data]);
	const isLoading = mintTxFetcher.state !== "idle";
	const hasError = mintTxFetcher.state === "idle" && mintTxFetcher.data === undefined && suiAddr;
	const error = hasError ? "Failed to load transactions" : null;

	// Function to fetch mint transactions
	const fetchMintTxs = useCallback(() => {
		if (suiAddr) {
			makeReq<QueryMintTxResp>(mintTxFetcher, { method: "queryMintTx", params: [network, suiAddr] });
		}
	}, [suiAddr, mintTxFetcher, network]);

	// Handle address changes, interval setup, and initial fetch
	useEffect(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Handle address change or initial fetch
		if (prevSuiAddrRef.current !== suiAddr || (mintTxFetcher.state === "idle" && !mintTxs)) {
			prevSuiAddrRef.current = suiAddr;
			fetchMintTxs();
		}

		// Set up interval for automatic refetching
		intervalRef.current = setInterval(fetchMintTxs, 120000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [suiAddr, fetchMintTxs, mintTxFetcher.state, mintTxs, mintTxFetcher]);

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 py-4">
			{/* Header */}
			<div className="space-y-2 text-center">
				<h1 className="text-4xl font-bold">
					Mint<span className="text-primary"> nBTC</span>
				</h1>
				<p className="text-base-content/70 text-lg">
					Deposit Bitcoin and mint Native Bitcoin tokens on Sui network
				</p>
			</div>

			{/* Main Content Grid */}
			<div className="grid gap-4 lg:grid-cols-[1fr_400px]">
				{/* Left Column */}
				<div className="space-y-6">
					<MintBTC fetchMintTxs={fetchMintTxs} />

					{/* Transaction Table Section */}
					{suiAddr && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold">Your Mint Transactions</h2>
								<button
									onClick={fetchMintTxs}
									disabled={isLoading}
									className="btn btn-sm btn-accent"
									title="Refresh transactions"
								>
									<RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
									Refresh
								</button>
							</div>

							{error && (
								<div className="alert alert-error">
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

					<FAQ faqs={FAQS} />
				</div>

				{/* Right Column - Info & Instructions */}
				<div className="space-y-4">
					<BlockInfoCard />

					<div className="card">
						<div className="card-body">
							<h2 className="card-title text-lg">Tutorial Video</h2>
							<div className="aspect-video w-full">
								<iframe
									src="https://drive.google.com/file/d/1pZNX2RG5L97B0Vh8pPb0OJSaaGRCdLcr/preview"
									width="100%"
									height="100%"
									allow="autoplay"
									className="h-full w-full rounded-lg"
									title="TestnetV2Walkthrough"
								/>
							</div>
						</div>
					</div>

					<Collapse title="Wallet Setup Instructions">
						<RegtestInstructions />
					</Collapse>
				</div>
			</div>
		</div>
	);
}
