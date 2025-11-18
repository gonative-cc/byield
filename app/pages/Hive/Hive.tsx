import { useCurrentAccount } from "@mysten/dapp-kit";
import { heroTitle } from "~/util/tailwind";
import { SuiConnectModal } from "~/components/Wallet/SuiWallet/SuiModal";

// TODO:replace src with real image src
const SBT_TOKENS = [
	{
		src: "/assets/coins/nbtc.svg",
		title: "Social SBTs",
		description:
			"Verify your identity and social accounts. This proves your role as an active, verified member of the Native community.",
	},
	{
		src: "/assets/coins/nbtc.svg",
		title: "Lockdrop SBTs",
		description:
			"Commit USDC, SUI, or WBTC to the pre-mainnet lockdrop. This verifies you as a foundational liquidity provider.",
	},
	{
		src: "/assets/coins/nbtc.svg",
		title: "Referral SBTs",
		description:
			"Refer high-quality, verified users who also contribute. This proves your impact on growing a secure and active user base.",
	},
];

export function Hive() {
	return (
		<div className="flex flex-col items-center gap-8 px-2 pt-2">
			<HiveTabs />
		</div>
	);
}

function Home() {
	const currentSuiAccount = useCurrentAccount();
	const isSuiWalletConnected = !!currentSuiAccount;

	return (
		<div className="flex flex-col items-center gap-8 px-2 pt-2">
			<p className={heroTitle + " max-w-96"}>
				<span className="text-primary-foreground">Native</span> Hive Program
			</p>
			<span className="text-xl">Build the Hive. Earn Your Swarm.</span>
			<span className="text-xl">
				The Native Hive Program is the canonical ledger of your contributions..
			</span>
			<span className="text-xl">
				Mint SBTs by securing liquidity, building the community, and verifying your role in the
				genesis of the BYield hub.
			</span>
			<span className="text-xl font-semibold">
				Your Hive SBTs are the verifiable record of your impact.
			</span>
			<span className="text-xl font-semibold">Connect wallet to view your hive dashboard</span>
			{!isSuiWalletConnected && <SuiConnectModal />}
			<span className="text-3xl">How to earn Soul Bound Tokens (SBTs)</span>
			<div className="flex gap-2">
				{SBT_TOKENS.map((token) => (
					<div key={token.title} className="card w-96">
						<figure>
							{/* TODO: remove hard coded image */}
							<img
								src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
								alt="Shoes"
							/>
						</figure>
						<div className="card-body">
							<h2 className="card-title">{token.title}</h2>
							<p>{token.description}</p>
						</div>
					</div>
				))}
			</div>
			<span className="max-w-3/5 text-2xl">
				<span className="font-semibold">Each SBT Category contains 10 tiers.</span> Mint higher tiers
				to prove deeper contributions and earn more Provenance Score.
			</span>
			<img
				src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
				alt="Shoes"
				className=""
			/>
			<span className="text-3xl">What is my Provenance Score?</span>
			<span>
				Your Provenance Score is the total sum of the points from every SBT tier you have claimed and
				minted. It quantifies your on-chain impact.
			</span>
			<span className="text-3xl font-semibold">Global Multipliers</span>
			<span>Early Bee (first 2,000 eligible wallets) +20%</span>
			<span>Beelievers Normal NFT holder+50%</span>
			{!isSuiWalletConnected && (
				<>
					<span className="text-3xl font-semibold">Join the Hive</span>
					<span>
						Connect your wallet to mint your first Hive SBTs and establish your permanent,
						on-chain role in Native&apos;s genesis.
					</span>
					<SuiConnectModal />
				</>
			)}
		</div>
	);
}

function Dashboard() {
	// TODO: replace hardcoded data
	return (
		<div className="flex flex-col gap-8 px-2 pt-2">
			<p className={heroTitle + " max-w-96"}>
				<span className="text-primary-foreground items-center">Native</span> Hive Program
			</p>
			<span className="items-center text-xl">Build the Hive. Earn Your Swarm.</span>
			<span className="text-3xl font-semibold">Progress Hub</span>
			<div className="flex flex-col gap-4">
				<span className="mb-4 font-semibold">Hive Score: </span>
				<div className="flex flex-col gap-2">
					<span className="font-semibold">Lockdrop SBT: </span>
					<span className="font-semibold">Social SBT: </span>
					<span className="mb-4 font-semibold">Referral SBT: </span>
				</div>

				<span className="mb-4 font-semibold">Total SBT&apos;s claimed: 1/30 </span>
			</div>
		</div>
	);
}

function FAQ() {
	return "to be implemented";
}

const renderTabHeader = (title: string, checked = false) => (
	<input
		type="radio"
		name="tab_hive"
		className="tab checked:bg-primary rounded-full"
		aria-label={title}
		defaultChecked={checked}
	/>
);

const HiveTabs = () => (
	<div className="tabs tabs-boxed rounded-full p-1">
		{renderTabHeader("Home", true)}
		<div className="tab-content py-6">
			<Home />
		</div>
		{renderTabHeader("Dashboard")}
		<div className="tab-content py-6">
			<Dashboard />
		</div>
		{renderTabHeader("FAQ")}
		<div className="tab-content py-6">
			<FAQ />
		</div>
	</div>
);
