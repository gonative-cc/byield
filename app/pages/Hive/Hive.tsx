import { useCurrentAccount } from "@mysten/dapp-kit";
import { heroTitle } from "~/util/tailwind";
import { FAQ as SocialSBTFAQ } from "~/components/FAQ";
import { useState } from "react";

type TabType = "home" | "dashboard" | "faq";

const SBT_TOKENS = [
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

export function HivePage() {
	return (
		<div className="flex flex-col items-center gap-8 px-2 pt-2">
			<ControlledHiveTabs />
		</div>
	);
}

interface HomeProps {
	redirectTab: (redirectTab: TabType) => void;
}

function Home({ redirectTab }: HomeProps) {
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
						<button className="btn btn-primary btn-lg" onClick={() => redirectTab("dashboard")}>
							Connect wallet to view your hive dashboard
						</button>
					</div>
				)}
			</div>

			{/* SBT Tokens Section */}
			<div className="space-y-8">
				<h2 className="text-center text-3xl font-bold">How to earn Soul Bound Tokens (SBTs)</h2>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{SBT_TOKENS.map((token) => (
						<div
							key={token.title}
							className="card bg-base-200 shadow-lg transition-shadow hover:shadow-xl"
						>
							<figure className="pt-6">
								<img src={token.src} alt={token.title} className="h-20 w-20 object-contain" />
							</figure>
							<div className="card-body">
								<h3 className="card-title justify-center">{token.title}</h3>
								<p className="text-base-content/70">{token.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

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

			{/* Global Multipliers Section */}
			<div className="space-y-6">
				<h2 className="text-center text-3xl font-bold">Global Multipliers</h2>
				<div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
					<div className="badge badge-lg badge-outline p-4">
						Early Bee (first 2,000 eligible wallets) +20%
					</div>
					<div className="badge badge-lg badge-outline p-4">Beelievers Normal NFT holder +50%</div>
					<div className="badge badge-lg badge-outline p-4">Beelievers Mythics NFT holder +50%</div>
					<div className="badge badge-lg badge-outline p-4">Holding {">=5"} Beelievers +50%</div>
					<div className="badge badge-lg badge-outline p-4">Holding {">=10"} Beelievers +50%</div>
					<div className="badge badge-lg badge-outline p-4">Holding {">=20"} Beelievers +50%</div>
					<div className="badge badge-lg badge-outline p-4 md:col-span-2">
						Referral +1% to the referrer per user referred
					</div>
				</div>
			</div>

			{/* Join the Hive Section */}
			{!isSuiWalletConnected && (
				<div className="bg-primary/10 space-y-6 rounded-2xl p-8 text-center">
					<h2 className="text-primary-foreground text-3xl font-bold">Join the Hive</h2>
					<p className="mx-auto max-w-2xl text-lg">
						Connect your wallet to mint your first Hive SBTs and establish your permanent,
						on-chain role in Native&apos;s genesis.
					</p>
					<button className="btn btn-primary btn-lg" onClick={() => redirectTab("dashboard")}>
						Connect wallet to view your hive dashboard
					</button>
				</div>
			)}
		</div>
	);
}

function Dashboard() {
	return (
		<div className="space-y-6">
			{/* Header with Total Hive Score and Status Badges */}
			<div className="bg-base-300 rounded-lg p-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<div className="text-base-content/70 mb-1 text-sm">Total Hive Score ⚡</div>
						<div className="text-5xl font-bold text-white">4,250</div>
					</div>
					<div className="flex flex-wrap gap-2">
						<div className="badge badge-warning badge-outline px-3 py-2">🐝 Early Bee Active</div>
						<div className="badge badge-warning badge-outline px-3 py-2">
							🎯 Beeliever NFT Active
						</div>
					</div>
				</div>
				<div className="mt-4 flex items-center gap-2 text-sm">
					<span className="text-base-content/70">Referral Link:</span>
					<code className="bg-base-100 rounded px-2 py-1 text-xs">native.cc/r/hive-bee-123</code>
					<button className="btn btn-xs btn-ghost">📋</button>
				</div>
			</div>

			{/* Category Breakdown */}
			<div>
				<h2 className="mb-4 text-xl font-bold">Category Breakdown</h2>

				{/* Contributor Section */}
				<div className="bg-base-300 mb-4 rounded-lg p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="bg-warning flex h-8 w-8 items-center justify-center rounded">
								🛡️
							</div>
							<div>
								<h3 className="font-bold">Contributor (Primary)</h3>
								<p className="text-base-content/70 text-sm">
									Lock liquidity to earn the highest tier SBTs.
								</p>
							</div>
						</div>
						<button className="btn btn-warning">⬆️ Deposit Assets</button>
					</div>
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<div>
							<div className="text-base-content/70 mb-1 text-sm">Current Tier</div>
							<div className="text-warning mb-2 font-bold">IV - Hive Saver</div>
							<div className="mb-1 text-2xl font-bold text-white">$2,750</div>
							<div className="text-base-content/70 text-sm">Locked Liquidity</div>
						</div>
						<div>
							<div className="text-base-content/70 mb-2 text-sm">
								Next Tier: V - Vault Keeper
							</div>
							<div className="bg-base-100 mb-2 h-2 w-full rounded-full">
								<div className="bg-warning h-2 rounded-full" style={{ width: "55%" }}></div>
							</div>
							<div className="text-base-content/70 text-sm">Reach $5,000 to upgrade</div>
							<div className="text-base-content/50 mt-1 text-xs">
								Deposits go to the Lockdrop Escrow.
							</div>
						</div>
					</div>
				</div>

				{/* Member and Spreader Sections */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{/* Member Section */}
					<div className="bg-base-300 rounded-lg p-6">
						<div className="mb-4 flex items-center gap-3">
							<div className="bg-info flex h-8 w-8 items-center justify-center rounded">👤</div>
							<h3 className="font-bold">Member</h3>
						</div>
						<div className="mb-4">
							<div className="text-base-content/70 mb-1 text-sm">Current Tier</div>
							<div className="text-info mb-2 font-bold">V - BYield Profile</div>
							<div className="text-2xl font-bold text-white">5</div>
							<div className="text-base-content/70 text-sm">Tasks Completed</div>
						</div>
						<div>
							<div className="text-base-content/70 mb-2 text-sm">
								Next Tier: VI - Pollen Seeker
							</div>
							<div className="bg-base-100 mb-2 h-2 w-full rounded-full">
								<div className="bg-info h-2 rounded-full" style={{ width: "83%" }}></div>
							</div>
							<div className="text-base-content/70 text-sm">Req: Obtain Discord Role</div>
						</div>
					</div>

					{/* Spreader Section */}
					<div className="bg-base-300 rounded-lg p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="bg-success flex h-8 w-8 items-center justify-center rounded">
									🌐
								</div>
								<h3 className="font-bold">Spreader</h3>
							</div>
							<button className="btn btn-success btn-sm">Refer & Earn</button>
						</div>
						<div className="mb-4">
							<div className="text-base-content/70 mb-1 text-sm">Current Tier</div>
							<div className="text-success mb-2 font-bold">II - Network Starter</div>
							<div className="text-2xl font-bold text-white">4</div>
							<div className="text-base-content/70 text-sm">Verified Referrals</div>
						</div>
						<div className="mb-4">
							<div className="text-base-content/70 mb-2 text-sm">Your Invite Link</div>
							<div className="flex items-center gap-2">
								<code className="bg-base-100 flex-1 rounded px-2 py-1 text-xs">
									https://native.cc/r/hive-bee-123
								</code>
								<button className="btn btn-xs btn-ghost">📋</button>
							</div>
						</div>
						<div>
							<div className="text-base-content/70 mb-2 text-sm">
								Next Tier: III - Signal Booster
							</div>
							<div className="bg-base-100 mb-2 h-2 w-full rounded-full">
								<div className="bg-success h-2 rounded-full" style={{ width: "80%" }}></div>
							</div>
							<div className="text-base-content/70 text-sm">Req: 5 Verified Referrals</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function FAQ() {
	return (
		<div className="mt-8">
			<SocialSBTFAQ faqs={[]} />
		</div>
	);
}

const ControlledHiveTabs = () => {
	const [activeTab, setActiveTab] = useState<TabType>("home");

	const redirectTab = (redirectTab: TabType) => {
		setActiveTab(() => redirectTab);
	};

	return (
		<div className="w-full">
			<div className="mb-12 flex justify-center">
				<div className="tabs tabs-boxed bg-base-200 rounded-full shadow-lg">
					<button
						onClick={() => setActiveTab("home")}
						className={`tab font-medium ${activeTab === "home" ? "bg-primary text-primary-content rounded-full" : ""}`}
					>
						Home
					</button>
					<button
						onClick={() => setActiveTab("dashboard")}
						className={`tab font-medium ${activeTab === "dashboard" ? "bg-primary text-primary-content rounded-full" : ""}`}
					>
						Dashboard
					</button>
					<button
						onClick={() => setActiveTab("faq")}
						className={`tab font-medium ${activeTab === "faq" ? "bg-primary text-primary-content rounded-full" : ""}`}
					>
						FAQ
					</button>
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-4">
				{activeTab === "home" && <Home redirectTab={redirectTab} />}
				{activeTab === "dashboard" && <Dashboard />}
				{activeTab === "faq" && <FAQ />}
			</div>
		</div>
	);
};
