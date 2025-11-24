import { AlertTriangle } from "lucide-react";
import { FAQ as SocialSBTFAQ } from "~/components/FAQ";

const FAQS = [
	{
		id: "faq-1",
		question: "What is the purpose of the Lockdrop?",
		answer: "The Lockdrop bootstraps Day-0 liquidity for the nBTC protocol. By committing capital now, you ensure that when Mainnet goes live, there is immediate, deep liquidity for the ecosystem. In exchange for this commitment, you earn Hive SBTs and a Swarm Score, proving your status as a founding contributor.",
	},
	{
		id: "faq-2",
		question: "Can I withdraw my funds before Mainnet?",
		answer: "No. The Lockdrop is a one-way bridge to Mainnet. Once you deposit, your funds are held in the escrow contract until the official launch. Do not deposit funds you may need to access in the short term.",
	},
	{
		id: "faq-3",
		question: "How exactly do I get my nBTC?",
		answer: "You do not need to claim anything. Upon Mainnet launch, the protocol will automatically execute the conversion and airdrop the resulting nBTC directly to your wallet. You will simply see nBTC appear in your balance.",
	},
	{
		id: "faq-4",
		question: "Does my deposit earn yield while locked?",
		answer: `No. The assets sit idle in the secure escrow contract during the pre-mainnet phase. The "yield" you earn during this period is in the form of SBTs and Score, which positions you for future ecosystem rewards and verifies your early support.`,
	},
	{
		id: "faq-5",
		question: "What assets can I deposit?",
		answer: "You can deposit SUI, USDC (Sui-native), or WBTC (Wormhole-wrapped BTC on Sui). All assets are treated equally for scoring based on their USD value.",
	},
	{
		id: "faq-6",
		question: "What are Hive SBTs?",
		answer: "Hive SBTs are non-transferable, on-chain tokens that serve as a permanent, verifiable record of your contributions to the Native ecosystem. Each SBT represents a specific achievement or level of engagement within the program. They are Soul-Bound Tokens, meaning they are permanently tied to your wallet and cannot be transferred or sold.",
	},
	{
		id: "faq-7",
		question: "What is my Swarm Score?",
		answer: "Your Swarm Score is a cumulative total of all the points you earn from minting Hive SBTs. It's a quantitative measure of your overall contribution and verifiable impact within the program.",
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
					<strong>1. Funds are Locked Until Mainnet:</strong> By depositing assets (SUI, USDC, WBTC)
					into the Lockdrop Escrow, you acknowledge that these funds are strictly locked until the
					Native nBTC Mainnet launch. There is no early withdrawal function.
				</p>
				<p>
					<strong>2. Conversion & Valuation Mechanism:</strong> Your deposit is a liquidity
					commitment. At Mainnet launch, deposited assets are converted to USDC, then to native
					Bitcoin to mint nBTC. The amount of nBTC you receive is based on the USD value at the time
					of the Mainnet Conversion Event, not the time of deposit.
				</p>
				<p>
					<strong>3. Slippage & Swap Fees:</strong> The conversion flow may incur standard network
					swap fees and minor slippage. While the protocol optimizes for efficiency, final amounts
					may vary slightly due to market conditions at launch.
				</p>
			</div>
		</div>
	</div>
);

export function HiveFAQ() {
	return (
		<div className="mt-8">
			<TransparencySection />
			<SocialSBTFAQ faqs={FAQS} />
		</div>
	);
}
