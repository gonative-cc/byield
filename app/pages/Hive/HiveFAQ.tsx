import { AlertTriangle } from "lucide-react";
import { FAQ } from "~/components/FAQ";

const GENERAL_FAQS = [
	{
		id: "faq-1",
		question: "What is the Native Hive Program?",
		answer: "The Native Hive Program is our initiative to recognize and reward early contributors. By providing liquidity, verifying your identity, and growing the community, you earn Hive SBTs (Soul-Bound Tokens) and build your Hive Score. This establishes your verifiable on-chain impact from day one.",
	},
	{
		id: "faq-2",
		question: "What are Hive SBTs?",
		answer: `Hive SBTs are non-transferable, on-chain badges that serve as a permanent record of your contributions. Each SBT represents a specific achievement (e.g., "Seed Locker" for depositing liquidity, or "Network Starter" for referring users). Collecting these SBTs is the only way to increase your Swarm Score.`,
	},
	{
		id: "faq-3",
		question: "What is my Hive Score and why does it matter?",
		answer: "Your Swarm Score is the cumulative total of points from every SBT you have minted. It acts as a reputation primitive within the Native ecosystem. A higher score signifies a deeper commitment to the Hive and may unlock exclusive rewards.",
	},
	{
		id: "faq-4",
		question: "What are Multipliers?",
		answer: `The Multipliers are bonuses applied to your total Hive Score for holding specific ecosystem assets, such as Beelievers NFTs. These multipliers are designed to reward long-term alignment. Check the dashboard for the current active multipliers.`,
	},
];

const HIVE_CONTRIBUTOR_FAQ = [
	{
		id: "faq-5",
		question: "What assets can I deposit into the Hive Contributor Lockdrop?",
		answer: "The Lockdrop accepts USDC (Sui-native) only. This ensures a stable value commitment leading up to the mainnet conversion.",
	},
	{
		id: "faq-6",
		question: "Can I withdraw my funds before Mainnet?",
		answer: "No. The Lockdrop is a one-way bridge to Mainnet. Do not deposit funds you may need to access in the short term.",
	},
	{
		id: "faq-7",
		question: "How do I get my nBTC?",
		answer: "We will release more information in the upcoming weeks.",
	},
	{
		id: "faq-8",
		question: "Does my deposit earn yield while locked?",
		answer: `No. The assets sit idle in the secure escrow contract during the pre-mainnet phase. The "yield" you earn during this period is in the form of the SBTs and Score, which positions you for future ecosystem rewards.`,
	},
	{
		id: "faq-9",
		question: "Is the Lockdrop secure?",
		answer: `Yes. The Lockdrop Escrow is a simple, audited smart contract on Sui. It is administered by a Genesis Multisig composed of the Native core team and trusted advisors. The multisig’s only permissions are to pause the contract in an emergency or trigger the final migration to Mainnet.`,
	},
	{
		id: "faq-10",
		question: "What happens if the Mainnet launch is delayed?",
		answer: `Your funds remain safely locked in the escrow contract until the launch occurs. While we are targeting a specific window (e.g., January 2026), software development can be unpredictable. By depositing, you accept that the lock duration depends on the readiness of the Mainnet release.`,
	},
];

const SOCIAL_FAQS = [
	{
		id: "faq-11",
		question: "How do Referrals work?",
		answer: `You can earn Hive Spreader SBTs by referring new users. However, to prevent bot spam, a referral is only counted as "verified" if the user you refer completes at least Tier 1 of the Hive Contributor (deposits ~$21 USDC).`,
	},
	{
		id: "faq-12",
		question: "Why didn't my referral count go up?",
		answer: `If you invited a friend but your count didn't increase, they likely haven't verified their wallet or deposited the minimum liquidity required to activate their account.`,
	},
	{
		id: "faq-13",
		question: "Can I transfer or sell my SBTs?",
		answer: "No. Hive SBTs are Soul-Bound, meaning they are permanently tied to your wallet. They are a record of your personal contribution and cannot be traded.",
	},
];

const TransparencySection = () => (
	<div className="card card-border border-primary/20 bg-primary/5 mb-12 border">
		<div className="card-body">
			<div className="text-primary-foreground mb-4 flex items-center gap-3">
				<AlertTriangle className="h-6 w-6" />
				<h2 className="text-xl font-semibold">Transparency Disclosure</h2>
			</div>
			<div className="space-y-4 text-sm leading-relaxed md:text-base">
				<p>
					<strong>1. Funds are Locked Until Mainnet:</strong> By depositing USDC into the Escrow,
					you acknowledge that these funds are strictly locked until the Native nBTC Mainnet launch.
					There is no early withdrawal function. Your capital is committed to the genesis of the
					protocol.
				</p>
				<p>
					<strong>2. Conversion Mechanism (USDC to nBTC):</strong> Your deposit is a liquidity
					commitment that will be converted into nBTC after Mainnet.
				</p>
				<p>
					After Mainnet launch, the aggregate USDC pool will be used to acquire native Bitcoin
					(BTC). This BTC is then deposited into the Native protocol to mint nBTC. The amount of
					nBTC you receive is determined by the market price of Bitcoin at the time of the Mainnet
					Conversion Event.
				</p>
				<p>
					<span>Example:</span> If you lock 1,000 USDC today, that value is held stable. After
					Mainnet, your 1,000 USDC will be used to purchase BTC at the then-current market rate,
					which is minted as nBTC to your wallet.
				</p>
				<p>
					<strong>3. Slippage & Execution:</strong> The conversion from USDC to BTC may incur
					standard network swap fees and minor slippage. The protocol will execute these trades
					efficiently to minimize loss, but the final nBTC amount may vary slightly from the exact
					oracle price due to market liquidity conditions at the time of launch.
				</p>
			</div>
		</div>
	</div>
);

export function HiveFAQ() {
	return (
		<div className="mt-8">
			<TransparencySection />
			<FAQ faqs={GENERAL_FAQS} title="General Program FAQ" className="max-w-full" />
			<FAQ
				faqs={HIVE_CONTRIBUTOR_FAQ}
				title="Hive Contributor Lockdrop SBT FAQ"
				className="max-w-full"
			/>
			<FAQ faqs={SOCIAL_FAQS} title="Referrals & Socials SBT FAQ" className="max-w-full" />
		</div>
	);
}
