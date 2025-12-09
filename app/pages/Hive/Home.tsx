import { useCurrentAccount } from "@mysten/dapp-kit";
import { heroTitle } from "~/util/tailwind";
import type { TabType } from "./types";
import { ChevronDown, ChevronUp, Info, Share2, Shield, Users } from "lucide-react";
import { useState } from "react";

interface SBTToken {
	src: string;
	title: string;
	description: string;
}

const SBT_TOKENS: SBTToken[] = [
	{
		src: "/assets/lockdrop/SocialSBT.svg",
		title: "Social SBTs",
		description:
			"Verify your identity and social accounts. This proves your role as an active, verified member of the Native community.",
	},
	{
		src: "/assets/lockdrop/LockdropSBT.svg",
		title: "Lockdrop SBTs",
		description:
			"Commit USDC, SUI, or WBTC to the pre-mainnet lockdrop. This verifies you as a foundational liquidity provider.",
	},
	{
		src: "/assets/lockdrop/ReferralSBT.svg",
		title: "Referral SBTs",
		description:
			"Refer high-quality, verified users who also contribute. This proves your impact on growing a secure and active user base.",
	},
];

interface MultiplierRule {
	title: string;
	badge: string;
	badgeColor: string;
	description: string;
	items: {
		id: string;
		label: string;
		value: string;
		description: string;
	}[];
}

const MULTIPLIER_RULES: MultiplierRule[] = [
	{
		title: "Global Multipliers",
		badge: "Stackable",
		badgeColor: "bg-success/10 text-success border-success-500/20",
		description: "These bonuses add up on top of your base score.",
		items: [
			{
				id: "early_bee",
				label: "Early Bee",
				value: "+20%",
				description: "First 2,000 eligible wallets.",
			},
		],
	},
	{
		title: "Beeliever Status",
		badge: "Highest Applies",
		badgeColor: "bg-primary/10 text-primary border-primary/20",
		description: "Based on the rarity of your NFT. These do not stack (highest takes priority).",
		items: [
			{
				id: "nft_normal",
				label: "Standard Holder",
				value: "+15%",
				description: "Hold a Beeliever NFT",
			},
			{ id: "nft_mythic", label: "Mythic Holder", value: "+30%", description: "Hold a Mythic NFT" },
		],
	},
	{
		title: "Whale Bonus",
		badge: "Highest Applies",
		badgeColor: "bg-info/10 text-info border-info/20",
		description: "Based on the quantity of NFTs held. These do not stack (highest takes priority).",
		items: [
			{ id: "qty_5", label: "Hive 5", value: "+5%", description: "Hold ≥ 5 NFTs" },
			{ id: "qty_10", label: "Hive 10", value: "+10%", description: "Hold ≥ 10 NFTs" },
			{ id: "qty_20", label: "Hive 20", value: "+15%", description: "Hold ≥ 20 NFTs" },
		],
	},
];

const MultiplierGroup = ({ group }: { group: MultiplierRule }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<div className="overflow-hidden rounded-xl border">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="hover:bg-base-100/50 flex w-full items-center justify-between p-4 transition-colors"
			>
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold">{group.title}</h3>
					<span
						className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${group.badgeColor}`}
					>
						{group.badge}
					</span>
				</div>
				{isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
			</button>

			<div
				className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
			>
				<div className="border-base-100/50 border-t p-4 pt-0">
					<p className="text-base-content/70 mt-4 mb-4 flex items-start gap-2 text-sm">
						<Info className="mt-0.5 h-4 w-4 shrink-0" />
						{group.description}
						{group.badge === "Highest Applies" && (
							<span className="text-primary-foreground ml-1">
								*These do not stack, the highest takes priority.
							</span>
						)}
					</p>

					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="text-base-content/70 border-b text-xs uppercase">
								<tr>
									<th className="px-4 py-3">Multiplier</th>
									<th className="px-4 py-3">Value</th>
									<th className="px-4 py-3">Requirement</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{group.items.map((item) => (
									<tr key={item.id}>
										<td className="px-4 py-3 font-medium">{item.label}</td>
										<td className="text-primary-foreground px-4 py-3 font-bold">
											{item.value}
										</td>
										<td className="text-base-content/50 px-4 py-3">{item.description}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

// Reusable Components
function SBTTokenCard({ token }: { token: SBTToken }) {
	return (
		<div className="card bg-base-200 shadow-lg transition-shadow hover:shadow-xl">
			<figure className="pt-6">
				<img src={token.src} alt={token.title} className="h-20 w-20 object-contain" />
			</figure>
			<div className="card-body">
				<h3 className="card-title justify-center">{token.title}</h3>
				<p className="text-base-content/70">{token.description}</p>
			</div>
		</div>
	);
}

function SBTTokensSection() {
	return (
		<div className="space-y-8">
			<h2 className="text-center text-3xl font-bold">How to earn Soul Bound Tokens (SBTs)</h2>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{SBT_TOKENS.map((token) => (
					<SBTTokenCard key={token.title} token={token} />
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
					<p className="text-base-content/70 leading-relaxed">
						Certain attributes amplify your base Hive Score. Review the rules below to understand
						how multipliers stack.
					</p>
				</div>
				<div className="grid w-full grid-cols-1 gap-6 md:w-2/3">
					{MULTIPLIER_RULES.map((group, idx) => (
						<MultiplierGroup key={idx} group={group} />
					))}
				</div>
			</div>
		</section>
	);
}

function SBTEarnSection() {
	const CATEGORIES = [
		{
			id: "contributor",
			title: "Hive Contributor",
			icon: <Shield className="h-6 w-6 text-orange-500" />,
			description:
				"Commit liquidity to the Genesis Lockdrop. Verify your role as a foundational provider.",
			metrics: "Asset Value Locked",
			tiers: [
				{ name: "Seed Locker", req: "$100" },
				{ name: "Vault Keeper", req: "$5,000" },
				{ name: "Master of the Vault", req: "$100,000" },
			],
		},
		{
			id: "member",
			title: "Hive Member",
			icon: <Users className="h-6 w-6 text-blue-500" />,
			description:
				"Link identities and verify social presence. Ensure network security and Sybil-resistance.",
			metrics: "Social Verification",
			tiers: [
				{ name: "Verified Visitor", req: "Discord OAuth" },
				{ name: "BYield Profile", req: "Create Profile" },
				{ name: "Hive Master", req: "Top Tier Role" },
			],
		},
		{
			id: "spreader",
			title: "Hive Spreader",
			icon: <Share2 className="h-6 w-6 text-green-500" />,
			description:
				"Refer high-quality users. Referrals count only upon identity verification of the referee.",
			metrics: "Verified Referrals",
			tiers: [
				{ name: "First Invite", req: "1 Referral" },
				{ name: "Growth Operator", req: "25 Referrals" },
				{ name: "Swarm Architect", req: "130 Referrals" },
			],
		},
	];

	return (
		<section className="mx-auto">
			<div className="mb-12 text-center">
				<h2 className="text-3xl font-bold md:text-4xl">How to Earn SBTs</h2>
				<div className="bg-primary-foreground mx-auto mt-4 h-1 w-20 rounded-full" />
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{CATEGORIES.map((cat) => (
					<div key={cat.id} className="card card-body overflow-hidden">
						<div className="bg-base-100 mb-6 w-fit rounded-lg border p-3">{cat.icon}</div>
						<h3 className="mb-3 text-xl font-semibold">{cat.title}</h3>
						<p className="mb-6 min-h-[60px] text-sm leading-relaxed text-slate-400">
							{cat.description}
						</p>
						<div className="space-y-3 border-t pt-6">
							<div className="text-base-content/70 text-xs font-medium tracking-wider uppercase">
								Example Tiers
							</div>
							{cat.tiers.map((tier, i) => (
								<div key={i} className="flex justify-between text-sm">
									<span>{tier.name}</span>
									<span className="text-base-content/70 font-mono">{tier.req}</span>
								</div>
							))}
						</div>
					</div>
				))}
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
						<div className="text-base-content/70 mx-auto max-w-4xl space-y-4 text-lg">
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
			<SBTEarnSection />

			{/* SBT Tiers Section */}
			<div className="space-y-6 text-center">
				<p className="mx-auto max-w-3xl text-xl">
					<span className="text-primary-foreground font-semibold">
						Each SBT Category contains 10 tiers.
					</span>{" "}
					Mint higher tiers to prove deeper contributions and earn more Provenance Score.
				</p>
				<div className="flex justify-center">
					<img src="/assets/lockdrop/SBTTiers.svg" alt="SBT Tiers" />
				</div>
			</div>

			{/* Provenance Score Section */}
			<div className="bg-base-200 space-y-6 rounded-2xl p-8">
				<h2 className="text-center text-3xl font-bold">What is my Provenance Score?</h2>
				<p className="text-base-content/80 mx-auto max-w-2xl text-center text-lg">
					Your Provenance Score is the total sum of the points from every SBT tier you have claimed
					and minted. It quantifies your on-chain impact.
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
