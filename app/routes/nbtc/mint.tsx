import { BitcoinNetworkType } from "sats-connect";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { BtcIndexerRpc } from "@gonative-cc/btcindexer/rpc-interface";
import type { SuiIndexerRpc } from "@gonative-cc/sui-indexer/rpc-interface";
import type { Route } from "./+types/mint";
import { RegtestInstructions } from "~/pages/nbtc-mint/RegtestInstructions";
import { MintBTCTable } from "~/pages/nbtc-mint/MintBTCTable";
import { RedeemBTCTable } from "~/pages/nbtc-mint/RedeemBTCTable";
import { ControlledNBTCTabs, type TabType } from "~/pages/nbtc-mint/ControlledNBTCTabs";
import { Collapse } from "~/components/ui/collapse";
import Controller from "~/server/nbtc/controller.server";
import { BitcoinBlockInfoCard } from "~/components/ui/BlockInfoCard";
import { FAQ } from "~/components/FAQ";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { heroTitle } from "~/tailwind";
import { useMobile } from "~/hooks/useMobile";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { useNetworkVariables } from "~/networkConfig";
import type { RedeemRequestEventRaw } from "@gonative-cc/sui-indexer/models";
import { useNBTCActions } from "~/pages/nbtc-mint/useNBTCActions";
import { logError } from "~/lib/log";

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

function InstallXverseWallet({ mobileOS }: { mobileOS: "ios" | "android" | null }) {
	const androidPlayStoreLink = "https://play.google.com/store/apps/details?id=com.secretkeylabs.xverse";
	const iOSStoreLink = "https://apps.apple.com/in/app/xverse-bitcoin-crypto-wallet/id1552272513";
	const websiteLink = "https://www.xverse.app";
	const href =
		mobileOS === "ios" ? iOSStoreLink : mobileOS === "android" ? androidPlayStoreLink : websiteLink;

	return (
		<div className="alert bg-primary">
			<div>
				<h3 className="font-bold">Xverse Wallet Required</h3>
				<div className="text-sm">
					To mint nBTC, you need the Xverse wallet installed.
					<a href={href} target="_blank" className="link link-neutral ml-1" rel="noreferrer">
						Download here
					</a>
				</div>
			</div>
		</div>
	);
}

const validNetworks: BitcoinNetworkType[] = [
	BitcoinNetworkType.Mainnet,
	BitcoinNetworkType.Testnet4,
	BitcoinNetworkType.Regtest,
];

// This is a server mint to post data to server (data mutations)
export async function action({ request, context }: Route.ActionArgs) {
	const reqData = await request.clone().json();
	const network = (reqData as { params: [BitcoinNetworkType] }).params[0];

	if (!network || !validNetworks.includes(network)) {
		throw new Error("Invalid network type");
	}

	const env = context.cloudflare.env;
	const ctrl = new Controller(
		network,
		env.BtcIndexer as unknown as BtcIndexerRpc,
		env.SuiIndexer as unknown as SuiIndexerRpc,
		env.BYieldD1,
	);
	return ctrl.handleJsonRPC(request);
}

export default function Mint() {
	const nbtcActions = useNBTCActions();
	const { network, currentAddress, isXverseInstalled } = useXverseWallet();
	const { nbtc } = useNetworkVariables();
	const { isMobile, mobileOS } = useMobile();
	const btcAddr = currentAddress?.address;
	const currentAccount = useCurrentAccount();
	const suiAddr = currentAccount?.address;
	const { refetch } = useCoinBalance("NBTC");

	const activeAddr = suiAddr || btcAddr;
	const prevAddrRef = useRef<string | undefined>(undefined);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const nbtcActionsRef = useRef(nbtcActions);
	useLayoutEffect(() => {
		nbtcActionsRef.current = nbtcActions;
	});

	const [activeTab, setActiveTab] = useState<TabType>("mint");
	const mintTxs = nbtcActions.mintTxs.data;
	const redeemTxs = nbtcActions.redeemTxs.data;
	const isLoading = nbtcActions.mintTxs.isLoading;
	const txFetcherError = nbtcActions.mintTxs.isError && activeAddr ? "Failed to load transactions" : null;

	const handleRedeemBTCSuccess = (txId: string, e: RedeemRequestEventRaw) => {
		nbtcActionsRef.current.putRedeemTx(network, nbtc.setupId, txId, JSON.stringify(e));
	};

	const isRedeemTxsLoading = nbtcActions.redeemTxs.isLoading;

	useEffect(() => {
		if (nbtcActionsRef.current.redeemTxs.isIdle && !redeemTxs?.length && currentAccount) {
			nbtcActionsRef.current.fetchRedeemTxs(network, currentAccount.address, nbtc.setupId);
		}
	}, [redeemTxs?.length, currentAccount, network, nbtc.setupId]);

	useEffect(() => {
		const fetchMintTxs = () => {
			if (activeAddr) {
				nbtcActionsRef.current.queryMintTx(network, suiAddr, btcAddr);
				refetch();
			}
		};

		const fetchRedeemTxs = () => {
			if (currentAccount) {
				nbtcActionsRef.current.fetchRedeemTxs(network, currentAccount.address, nbtc.setupId);
			}
		};

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		if (
			prevAddrRef.current !== activeAddr ||
			(nbtcActionsRef.current.mintTxs.isIdle && !mintTxs.length)
		) {
			prevAddrRef.current = activeAddr;
			fetchMintTxs();
		}

		intervalRef.current = setInterval(() => {
			try {
				fetchMintTxs();
				fetchRedeemTxs();
			} catch (err) {
				logError({ msg: "Background fetch failed", method: "mint:interval" }, err);
			}
		}, 120000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [activeAddr, network, suiAddr, btcAddr, currentAccount, nbtc.setupId, mintTxs.length, refetch]);

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 py-4">
			{isMobile && !isXverseInstalled && <InstallXverseWallet mobileOS={mobileOS} />}
			<h1 className={heroTitle + " text-center"}>
				<span className="text-primary-foreground">Mint & Redeem</span> nBTC
			</h1>

			{/* Main Content Grid */}
			<div className="grid gap-4 lg:grid-cols-[1fr_400px]">
				{/* Left Column */}
				<div className="space-y-6">
					<ControlledNBTCTabs
						fetchMintTxs={() => {
							if (activeAddr) {
								nbtcActions.queryMintTx(network, suiAddr, btcAddr);
								refetch();
							}
						}}
						fetchRedeemTxs={() => {
							if (currentAccount) {
								nbtcActions.fetchRedeemTxs(network, currentAccount.address, nbtc.setupId);
							}
						}}
						activeTab={activeTab}
						onTabChange={setActiveTab}
						handleRedeemBTCSuccess={handleRedeemBTCSuccess}
					/>

					{/* Transaction Table Section */}
					{activeAddr && (
						<>
							{txFetcherError && (
								<div className="alert alert-error">
									<div>
										<div className="font-medium">Failed to load transactions</div>
										<div className="text-sm opacity-80">{txFetcherError}</div>
										<button
											onClick={() => {
												if (activeAddr) {
													nbtcActions.queryMintTx(network, suiAddr, btcAddr);
													refetch();
												}
											}}
											className="btn btn-sm mt-2"
										>
											Retry
										</button>
									</div>
								</div>
							)}
							{!txFetcherError && (
								<button
									onClick={() => {
										if (activeAddr) {
											nbtcActions.queryMintTx(network, suiAddr, btcAddr);
											refetch();
										}
									}}
									disabled={isLoading}
									className="btn btn-sm btn-ghost"
									title="Refresh transactions"
								>
									<RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
									Refresh
								</button>
							)}

							{activeTab === "mint" && (
								<MintBTCTable data={mintTxs || []} isLoading={isLoading} />
							)}
							{activeTab === "redeem" && (
								<RedeemBTCTable data={redeemTxs || []} isLoading={isRedeemTxsLoading} />
							)}
						</>
					)}

					<FAQ faqs={FAQS} />
				</div>

				{/* Right Column - Info & Instructions */}
				<div className="space-y-4">
					<BitcoinBlockInfoCard />

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
