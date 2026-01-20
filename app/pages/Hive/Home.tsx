import { useCurrentAccount } from "@mysten/dapp-kit";
import { heroTitle } from "~/tailwind";
import type { TabType } from "./types";
import { Info } from "lucide-react";
import { Table } from "~/components/ui/table";
import type { Column } from "react-table";
import { Collapse } from "~/components/ui/collapse";
import type { ReactNode } from "react";

export function ReadMoreFAQ() {
	return (
		<a href="#faq" target="_blank" className="link link-primary">
			Read the FAQ to learn more.
		</a>
	);
}

interface SBTToken {
	src: string;
	title: string;
	description: string | ReactNode;
	tiers: {
		name: string;
		req: string;
	}[];
}

const SBT_TOKENS: SBTToken[] = [
	{
		src: "/assets/lockdrop/LockdropSBT.svg",
		title: "Hive Contributor SBTs",
		description: (
			<span>
				Commit USDC to the Genesis Lockdrop. These SBTs verify your role as a foundational liquidity
				provider for the nBTC protocol. <ReadMoreFAQ />
			</span>
		),
		tiers: [
			{ name: "Seed Locker", req: "$21" },
			{ name: "Vault Keeper", req: "$5,000" },
			{ name: "Sovereign Architect", req: "$100,000" },
		],
	},
	{
		src: "/assets/lockdrop/SocialSBT.svg",
		title: "Hive Member SBTs",
		description: (
			<span>
				Link your identities and verify your social presence. These SBTs prove you are a verified,
				active member of the Native community. <ReadMoreFAQ />
			</span>
		),
		tiers: [
			{ name: "Verified Visitor", req: "Discord OAuth" },
			{ name: "BYield Profile", req: "Create Profile" },
			{ name: "Hive Master", req: "Obtain Hive Master role" },
		],
	},
	{
		src: "/assets/lockdrop/ReferralSBT.svg",
		title: "Hive Spreader SBTs",
		description: (
			<span>
				Refer high-quality, verified users who also contribute. This proves your impact on growing a
				secure and active user base. <ReadMoreFAQ />
			</span>
		),
		tiers: [
			{ name: "First Invite", req: "1 Referral" },
			{ name: "Growth Operator", req: "25 Referrals" },
			{ name: "Swarm Architect", req: "130 Referrals" },
		],
	},
];

interface MultiplierItem {
	id: string;
	label: string;
	value: string;
	description: string;
}

interface MultiplierRule {
	title: string;
	badge: string;
	badgeColor: string;
	description: string;
	items: MultiplierItem[];
}

const MULTIPLIER_RULES: MultiplierRule[] = [
	{
		title: "Global Multipliers",
		badge: "Stackable",
		badgeColor: "badge-success",
		description: "These bonuses add up on top of your base score.",
		items: [
			{
				id: "early_bee",
				label: "Early Bee",
				value: "+5%",
				description: "First 1,000 eligible wallets.",
			},
		],
	},
	{
		title: "Beeliever Status",
		badge: "Highest Applies",
		badgeColor: "badge-primary-foreground",
		description: "Based on the rarity of your NFT. These do not stack (highest takes priority).",
		items: [
			{
				id: "nft_normal",
				label: "Beelievers Normal NFT Holder",
				value: "+5%",
				description: "Hold a Beeliever NFT",
			},
			{
				id: "nft_mythic",
				label: "Beelievers Mythic NFT Holder",
				value: "+10%",
				description: "Hold a Mythic NFT",
			},
		],
	},
	{
		title: "Whale Bonus",
		badge: "Highest Applies",
		badgeColor: "badge-info",
		description: "Based on the quantity of NFTs held. These do not stack (highest takes priority).",
		items: [
			{ id: "qty_5", label: "Hive 5", value: "+5%", description: "Holding ≥ 5 Beelievers NFTs" },
			{ id: "qty_10", label: "Hive 10", value: "+8%", description: "Holding ≥ 10 Beelievers NFTs" },
			{ id: "qty_20", label: "Hive 20", value: "+10%", description: "Holding ≥ 20 Beelievers NFTs" },
		],
	},
];

export const columns: Column<MultiplierItem>[] = [
	{ Header: "Multiplier", accessor: "label" },
	{ Header: "Value", accessor: "value" },
	{ Header: "Requirement", accessor: "description" },
];

function SBTTokenCard({ token, tiers }: { token: SBTToken; tiers: SBTToken["tiers"] }) {
	return (
		<div className="card bg-base-200 shadow-lg transition-shadow hover:shadow-xl">
			<figure className="pt-6">
				<img src={token.src} alt={token.title} className="h-20 w-20 object-contain" />
			</figure>
			<div className="card-body">
				<h3 className="card-title justify-center">{token.title}</h3>
				<p className="text-muted-foreground min-h-28">{token.description}</p>
				<div className="space-y-3 border-t pt-6">
					<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
						Example Tiers
					</div>
					{tiers.map((tier, i) => (
						<div key={i} className="flex justify-between text-sm">
							<span>{tier.name}</span>
							<span className="text-muted-foreground font-mono">{tier.req}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function SBTTokensSection() {
	return (
		<div className="space-y-8">
			<h2 className="text-center text-3xl font-bold">How to earn Soul Bound Tokens (SBTs)</h2>
			<div className="bg-primary-foreground mx-auto h-1 w-20 rounded-full" />
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{SBT_TOKENS.map((token) => (
					<SBTTokenCard key={token.title} token={token} tiers={token.tiers} />
				))}
			</div>
		</div>
	);
}

function GlobalMultipliersSection() {
	return (
		<section className="card card-body">
			<div className="flex flex-col items-start gap-12 md:flex-row">
				<div className="md:w-1/3">
					<h2 className="mb-4 text-2xl font-bold">Score Multipliers</h2>
					<p className="text-muted-foreground leading-relaxed">
						Certain attributes amplify your base Hive Score. Review the rules below to understand
						how multipliers stack.
					</p>
				</div>
				<div className="grid w-full grid-cols-1 gap-6 md:w-2/3">
					{MULTIPLIER_RULES.map((group) => (
						<Collapse
							key={group.title}
							title={
								<div className="flex items-center gap-3">
									<h3 className="text-sm font-semibold md:text-lg">{group.title}</h3>
									<span
										className={`badge badge-outline badge-xs md:badge-sm uppercase ${group.badgeColor}`}
									>
										{group.badge}
									</span>
								</div>
							}
						>
							<p className="text-muted-foreground mt-4 mb-4 flex items-start gap-2 text-sm">
								<Info className="mt-0.5 h-4 w-4 shrink-0" />
								{group.description}
								{group.badge === "Highest Applies" && (
									<span className="text-primary-foreground ml-1">
										*These do not stack, the highest takes priority.
									</span>
								)}
							</p>
							<Table columns={columns} data={group.items} />
						</Collapse>
					))}
				</div>
			</div>
		</section>
	);
}

interface HomeProps {
	redirectTab: (redirectTab: TabType) => void;
}

export function Home({ redirectTab }: HomeProps) {
	const currentSuiAccount = useCurrentAccount();
	const isSuiWalletConnected = !!currentSuiAccount;

	return (
		<div className="space-y-12">
			{/* Hero Section */}
			<div className="space-y-6 text-center">
				<h1 className={`${heroTitle} text-4xl uppercase md:text-5xl`}>
					<span className="text-primary-foreground">Native</span> Hive Program
				</h1>
				<p className="text-base-content/80 text-xl font-medium md:text-2xl">
					Build the Hive. Earn Your Swarm.
				</p>
				<div className="card">
					<div className="card-body">
						<div className="text-muted-foreground mx-auto max-w-4xl space-y-4 text-lg">
							<p>The Native Hive Program is the canonical ledger of your contributions.</p>
							<p>
								Mint SBTs by securing liquidity, building the community, and verifying your
								role in the genesis of the BYield hub.
							</p>
							<span className="divider" />
							<p className="text-primary-foreground text-xl font-semibold">
								Your Hive SBTs are the verifiable record of your impact.
							</p>
						</div>
					</div>
				</div>
				{!isSuiWalletConnected && (
					<div className="space-y-4">
						<button
							className="btn btn-primary md:btn-lg"
							onClick={() => redirectTab("dashboard")}
						>
							Connect wallet to view your hive dashboard
						</button>
					</div>
				)}
			</div>

			<SBTTokensSection />

			{/* SBT Tiers Section */}
			<div className="space-y-6 text-center">
				<p className="mx-auto max-w-3xl text-xl">
					<span className="text-primary-foreground font-semibold">
						Each SBT Category contains 10 tiers.
					</span>{" "}
					Mint higher tiers to prove deeper contributions and earn more Hive Score.
				</p>
				<div className="flex justify-center">
					<img src="/assets/lockdrop/SBTTiers.svg" alt="SBT Tiers" />
				</div>
			</div>

			{/* Hive Score Section */}
			<div className="bg-base-200 space-y-6 rounded-2xl p-8">
				<h2 className="text-center text-3xl font-bold">What is my Hive Score?</h2>
				<p className="text-base-content/80 mx-auto max-w-2xl text-center text-lg">
					Your Hive Score is the total sum of the points from every SBT tier you have claimed and
					minted. It quantifies your on-chain impact.
				</p>
			</div>

			<GlobalMultipliersSection />

			{/* Join the Hive Section */}
			{!isSuiWalletConnected && (
				<div className="bg-primary/10 space-y-6 rounded-2xl p-2 text-center md:p-8">
					<h2 className="text-primary-foreground text-3xl font-bold">Join the Hive</h2>
					<p className="mx-auto max-w-2xl text-lg">
						Connect your wallet to mint your first Hive SBTs and establish your permanent,
						on-chain role in Native&apos;s genesis.
					</p>
					<button className="btn btn-primary md:btn-lg" onClick={() => redirectTab("dashboard")}>
						Connect wallet to view your hive dashboard
					</button>
				</div>
			)}
		</div>
	);
}
