import { AlertTriangle } from "lucide-react";
import { FAQ } from "~/components/FAQ";

const GENERAL_FAQS = [
	{
		id: "faq-1",
		question: "What is the Native Hive Program?",
		answer: "The Native Hive Program is the foundational loyalty and reputation layer for the Native ecosystem. It is designed to recognize and reward the early liquidity providers, community builders, and network spreaders who help bootstrap the protocol. By participating now, you establish a verifiable, on-chain record of your impact from Day 0.",
	},
	{
		id: "faq-2",
		question: "What are Hive SBTs?",
		answer: `Hive SBTs (Soul-Bound Tokens) are permanent, non-transferable digital credentials that live in your wallet. Unlike standard NFTs, they cannot be sold or traded. They act as your on-chain "resume," proving exactly what you contributed to the Hive (e.g., "Seed Locker" for liquidity or "Wingman" for community support). Collecting these SBTs is the only way to build your Hive Score.`,
	},
	{
		id: "faq-3",
		question: "What is my Hive Score and why does it matter?",
		answer: `Your Hive Score is the cumulative point total from every SBT you have minted. It serves as your "Reputation Primitive" within the ecosystem. A higher score signifies a deeper commitment to the protocol.`,
	},
	{
		id: "faq-4",
		question: "What are Multipliers?",
		answer: (
			<>
				<p className="mb-4">
					The Multipliers are bonuses applied to your Hive Score for holding specific ecosystem
					assets, such as Beelievers NFTs. These multipliers are designed to reward long-term
					alignment. Check the dashboard for the current active multipliers.
				</p>
				<ul className="list-inside list-disc space-y-2">
					<li>
						<strong>Global Multipliers: </strong>Boosts from holding Beelievers NFTs or being an
						`Early Bee`` depositor.
					</li>
					<li>
						<strong>Time-Lock Multipliers: </strong>Applied at Mainnet based on how long your
						liquidity remained locked.
					</li>
				</ul>
			</>
		),
	},
];

const HIVE_CONTRIBUTOR_FAQ = [
	{
		id: "faq-5",
		question: "What are Hive Contributor SBTs?",
		answer: (
			<p>
				These SBTs identify the biggest supporters of the Native ecosystem. By committing USDC as
				foundational liquidity, you are helping grow the Native protocol. These badges verify your
				status as a <strong>Founding Architect</strong> of the network.
			</p>
		),
	},
	{
		id: "faq-6",
		question: "Why should I participate?",
		answer: "This is the highest-value activity in the Hive Program. By locking liquidity now, you earn the most substantial allocation of Hive Score and position yourself for the largest share of future rewards. You aren't just a user; you are backing the protocol's genesis.",
	},
	{
		id: "faq-7",
		question: "What assets can I deposit?",
		answer: (
			<p>
				To ensure a stable and secure launch, the Lockdrop accepts <strong>USDC (Sui-native)</strong>{" "}
				only. This ensures a consistent value commitment leading up to the mainnet conversion.
			</p>
		),
	},
	{
		id: "faq-8",
		question: "Can I withdraw my funds before Mainnet?",
		answer: `No. The Lockdrop is a one-way bridge to Mainnet. Once you deposit, your funds are securely held in the escrow contract until the official launch. Do not deposit funds you may need to access in the short term.`,
	},
	{
		id: "faq-9",
		question: "Does my deposit earn yield while locked?",
		answer: ` No. The assets sit idle in the secure escrow contract during the pre-mainnet phase. The "yield" you earn during this period is in the form of SBTs and Hive Score, which positions you for future ecosystem rewards and verifies your early support.`,
	},
	{
		id: "faq-10",
		question: "Do I get a bonus for locking early?",
		answer: (
			<p>
				Yes. True supporters are rewarded for their time. A <strong>Time-Lock Bonus</strong> is
				applied at Mainnet launch based on how long your funds were active. The earlier you lock your
				funds, the bigger the multiplier.
			</p>
		),
	},
	{
		id: "faq-11",
		question: "How do I get my nBTC?",
		answer: (
			<p>
				At Mainnet launch, you will be able to claim <strong>nBTC</strong> equivalent to the USD value
				of your lockdrop deposit. Your locked USDC is converted to Bitcoin and used to mint nBTC 1:1
				at the execution price. You will simply claim your new nBTC and will be able to start earning
				yield immediately with our partners.
			</p>
		),
	},
	{
		id: "faq-12",
		question: "Is the Lockdrop secure?",
		answer: `Yes. The Lockdrop Escrow is a simple, audited smart contract on Sui. The multisig’s only permissions are to pause the contract in an emergency or enable the final exchange to the nBTC.`,
	},
	{
		id: "faq-13",
		question: "What happens if the Mainnet launch is delayed?",
		answer: `Your funds remain safely locked in the escrow contract until the launch occurs. While we are targeting a specific window (e.g., February 2026), software development can be unpredictable. By depositing, you accept that the lock duration depends on the readiness of the Mainnet release.`,
	},
];

const SOCIAL_FAQS = [
	{
		id: "faq-11",
		question: "What are Hive Spreader SBTs?",
		answer: `These badges reward the true builders of the Native Ecosystem. By bringing high-quality contributors to the Hive, you aren't just inviting friends, you are building your own "Colony" and sharing in the network's growth.`,
	},
	{
		id: "faq-12",
		question: "Why should I become a Spreader?",
		answer: `If you have a voice, a community, or a network, this is your leverage. You can earn simply by inviting active users. These SBTs verify on-chain that you were a key driver of the protocol’s early adoption.`,
	},
	{
		id: "faq-13",
		question: `What counts as a "Verified Referral"?`,
		answer: (
			<p>
				We prioritize <strong>quality over quantity</strong>. For a referral to be valid and count
				toward your tier progress, the person you invite must verify their own identity (connect
				wallet) and <strong>complete Tier 1 of the Hive Contributor Lockdrop</strong> (deposit ~$21
				USDC).
			</p>
		),
	},
	{
		id: "faq-14",
		question: "Why is the Lockdrop required for referrals?",
		answer: (
			<p>
				This rule protects the Hive from bot spam and ensures you are credited for bringing in{" "}
				<strong>real contributors.</strong> Every &quot;Verified Referral&quot; represents actual
				liquidity and genuine interest added to the ecosystem, making your &quot;Swarm Architect&quot;
				status truly meaningful.
			</p>
		),
	},
	{
		id: "faq-15",
		question: "I invited a friend, why didn't my count go up?",
		answer: (
			<p>
				Your referral count on the dashboard <strong>only updates</strong> once your invitee completes
				the <strong>Tier 1 Lockdrop ($21 deposit).</strong> If they have only connected their wallet
				but haven&apos;t deposited, they are still &quot;pending&quot; and do not count yet. Remind
				them to secure their Seed Locker badge to unlock your points!
			</p>
		),
	},
];

const MEMBER_FAQS = [
	{
		id: "faq-16",
		question: "What are Hive Member SBTs?",
		answer: (
			<p>
				These tokens are your &quot;Proof of Loyalty&quot; in the Native Hive. They differentiate
				active, dedicated community members from passive users. Holding these SBTs proves you
				aren&apos;t just watching from the sidelines; it proves you are actually contributing to the
				culture, discussion, and growth of the Hive.
			</p>
		),
	},
	{
		id: "faq-17",
		question: "Why should I verify my identity?",
		answer: (
			<p>
				A healthy Hive requires real people. By linking your <strong>Discord and X accounts</strong>,
				you strengthen the network against bots. In return, you build an on-chain reputation that may
				unlock exclusive access, future rewards, and governance weight.
			</p>
		),
	},
	{
		id: "faq-18",
		question: "How do I earn the Community Roles (e.g., Hive Master)?",
		answer: (
			<>
				<p>
					These roles are tied directly to your Level inside the Native Discord server. You must
					earn XP to level up and unlock the corresponding SBT tier:
				</p>
				<ul className="mt-2 list-disc space-y-1 pl-5">
					<li>
						<strong>Pollen Seeker (Level 5):</strong> The entry point for new explorers.
					</li>
					<li>
						<strong>Buzzling (Level 20):</strong> For active members becoming familiar faces.
					</li>
					<li>
						<strong>Wingman (Level 40):</strong> For reliable supporters who always show up.
					</li>
					<li>
						<strong>Guardian of the Hive (Level 60):</strong> For trusted leaders protecting the
						integrity of the Hive.
					</li>
					<li>
						<strong>Hive Master (Level 80):</strong> The elite status for those setting the
						culture.
					</li>
				</ul>
			</>
		),
	},
	{
		id: "faq-19",
		question: "How do I earn XP to level up?",
		answer: (
			<>
				<p>
					XP is earned organically by being active in the Discord. You cannot buy it; you must earn
					it.
				</p>
				<ul className="mt-2 list-disc space-y-1 pl-5">
					<li>
						<strong>Chatting:</strong> Earn 15 XP for every minute you are actively chatting.
					</li>
					<li>
						<strong>Engage:</strong> Complete social missions (Like/RT) via the #engage channel
						for 10 XP per action.
					</li>
					<li>
						<strong>Voice Chats:</strong> Participate in community calls to earn bonus XP from
						moderators.
					</li>
				</ul>
			</>
		),
	},
	{
		id: "faq-20",
		question: "Can I reach 'Hive Master' quickly?",
		answer: (
			<p>
				<strong>No.</strong> This system is designed to reward consistency over intensity. Reaching
				high-tier roles like Guardian (Lvl 60) or Hive Master (Lvl 80) typically requires 3 to 6
				months of consistent contribution. If you are joining today, you likely won&apos;t reach the
				highest tiers before this campaign ends. These specific badges are a &quot;Thank You&quot; to
				the long-term believers who have been building with us for months.
			</p>
		),
	},
	{
		id: "faq-21",
		question: "Where do I check my progress?",
		answer: "Join the Native Discord and check your rank. Once you hit the required Level (e.g., Level 5), the role is automatically assigned to you on Discord, and you can then mint the corresponding SBT on the dashboard.",
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
		<div className="mt-8 space-y-8">
			<div id="transparency">
				<TransparencySection />
			</div>
			<div id="general-faq">
				<FAQ faqs={GENERAL_FAQS} title="General Program FAQ" className="max-w-full" />
			</div>
			<div id="contributor-faq">
				<FAQ
					faqs={HIVE_CONTRIBUTOR_FAQ}
					title="Hive Contributor FAQ (Lockdrop)"
					className="max-w-full"
				/>
			</div>
			<div id="member-faq">
				<FAQ faqs={MEMBER_FAQS} title="Hive Member FAQ (Social & Community)" className="max-w-full" />
			</div>
			<div id="social-faq">
				<FAQ faqs={SOCIAL_FAQS} title="Hive Spreader FAQ (Referrals)" className="max-w-full" />
			</div>
		</div>
	);
}
