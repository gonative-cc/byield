import { useCurrentAccount } from "@mysten/dapp-kit";
import { heroTitle } from "~/util/tailwind";
import type { TabType } from "./types";

interface SBTToken {
	src: string;
	title: string;
	description: string;
}

interface Multiplier {
	label: string;
	bonus: string;
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

const GLOBAL_MULTIPLIERS: Multiplier[] = [
	{ label: "Early Bee (first 2,000 eligible wallets)", bonus: "+20%" },
	{ label: "Beelievers Normal NFT holder", bonus: "+50%" },
	{ label: "Beelievers Mythics NFT holder", bonus: "+50%" },
	{ label: "Holding >=5 Beelievers", bonus: "+50%" },
	{ label: "Holding >=10 Beelievers", bonus: "+50%" },
	{ label: "Holding >=20 Beelievers", bonus: "+50%" },
	{ label: "Referral +1% to the referrer per user referred", bonus: "" },
];

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
		<div className="card shadow-lg">
			<div className="card-body">
				<h2 className="card-title mb-6 text-center text-2xl font-bold">Global Multipliers</h2>
				<ul className="space-y-3">
					{GLOBAL_MULTIPLIERS.map((multiplier, index) => (
						<li
							key={index}
							className="bg-base-100 flex items-center justify-between rounded-lg px-4 py-2"
						>
							<span className="text-sm md:text-base">{multiplier.label}</span>
							{multiplier.bonus && (
								<span className="badge badge-primary font-semibold">{multiplier.bonus}</span>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
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
				<h1 className={`${heroTitle} text-4xl md:text-5xl`}>
					<span className="text-primary-foreground">Native</span> Hive Program
				</h1>
				<p className="text-base-content/80 text-xl font-medium md:text-2xl">
					Build the Hive. Earn Your Swarm.
				</p>
				<div className="text-base-content/70 mx-auto max-w-4xl space-y-4 text-lg">
					<p>The Native Hive Program is the canonical ledger of your contributions.</p>
					<p>
						Mint SBTs by securing liquidity, building the community, and verifying your role in
						the genesis of the BYield hub.
					</p>
					<p className="text-primary-foreground text-xl font-semibold">
						Your Hive SBTs are the verifiable record of your impact.
					</p>
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
