import { useCurrentAccount } from "@mysten/dapp-kit";
import { CircleCheck, CirclePlus, Share2, Shield, Users, Wallet } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { CopyButton } from "~/components/ui/CopyButton";
import { DashboardSkeletonLoader } from "~/pages/Hive/SkeletonLoader";
import { SuiConnectModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { LockDropSbt, ReferralSbt, SocialSbt } from "./constant";
import { makeReq, type QueryUserDataResp } from "~/server/hive/jsonrpc";
import type { UserSbtData } from "~/server/hive/types";

interface HiveScoreHeaderProps {
	totalHiveScore?: number;
}

function HiveScoreHeader({ totalHiveScore }: HiveScoreHeaderProps) {
	return (
		<div className="card">
			<div className="card-body flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<div className="text-base-content/70 mb-1 text-sm">Total Hive Score ⚡</div>
					<div className="text-3xl font-bold text-white sm:text-5xl">{totalHiveScore}</div>
				</div>
				<div className="flex flex-col gap-4 lg:items-end">
					<div className="flex flex-wrap justify-start gap-2 lg:justify-end">
						<div className="badge badge-primary badge-outline">
							<CircleCheck size={16} /> Early Bee Active
						</div>
						<div className="badge badge-primary badge-outline">
							<CircleCheck size={16} /> Beeliever NFT Active
						</div>
					</div>
					<div className="badge badge-lg ml-auto flex items-center gap-2 text-sm">
						<span className="text-base-content/70">Referral Link:</span>
						{/* TODO: tbook is not sending this currently */}
						<code className="text-xs">native.cc/r/hive-bee-123</code>
						<CopyButton text={"native.cc/r/hive-bee-123"} />
					</div>
				</div>
			</div>
		</div>
	);
}

function ContributorCard() {
	// TODO: Get current level and next level from API
	const currentLevel = 2;
	const nextLevel = currentLevel + 1;
	const isNextLevelAvailable = nextLevel <= 10;
	const currentTier = LockDropSbt.tiers[currentLevel - 1];
	const nextTier = isNextLevelAvailable ? LockDropSbt.tiers[nextLevel - 1] : null;

	return (
		<div className="card mb-4">
			<div className="card-body">
				<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded">
							<Shield />
						</div>
						<div>
							<h3 className="font-bold">Contributor (Primary)</h3>
							<p className="text-base-content/70 text-sm">
								Lock liquidity to earn the highest tier SBTs.
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-2 sm:items-end">
						<button className="btn btn-primary btn-sm sm:btn-lg">
							<CirclePlus /> Deposit Assets
						</button>
						<div className="text-base-content/50 text-center text-xs sm:text-right">
							Deposits go to the Lockdrop Escrow.
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<div className="text-base-content/70 mb-1 text-sm">Current Tier</div>
						<div className="text-primary-foreground mb-2 font-bold">
							{currentTier.tier} - {currentTier.name}
						</div>
						<div className="mb-1 text-xl font-bold text-white sm:text-2xl">$2,750</div>
						<div className="text-base-content/70 text-sm">Locked Liquidity</div>
					</div>
					{nextTier && (
						<div>
							<div className="text-base-content/70 mb-2 text-sm">
								Next Tier: {nextTier.tier} - {nextTier.name}
							</div>
							<progress className="progress progress-primary mb-1" value={55} max="100" />
							<div className="text-base-content/70 text-sm">{nextTier.requirement}</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

interface MemberCardProps {
	claimedSocialSbts?: UserSbtData["claimedSocialSbts"];
}

function MemberCard({ claimedSocialSbts }: MemberCardProps) {
	const claimedSocialSbtsLength = claimedSocialSbts?.length || -1;
	const currentLevel = claimedSocialSbtsLength;
	const nextLevel = currentLevel + 1;
	const isNextLevelAvailable = nextLevel <= 10;
	const currentTier = SocialSbt.tiers[currentLevel - 1];
	const nextTier = isNextLevelAvailable ? SocialSbt.tiers[nextLevel - 1] : null;

	return (
		<div className="card">
			<div className="card-body">
				<div className="mb-4 flex items-start gap-3">
					<Users className="text-info shrink-0" />
					<h3 className="font-bold">Member</h3>
				</div>
				<div className="mb-4">
					<div className="text-base-content/70 mb-1 text-sm">Current Tier</div>
					<div className="text-info mb-2 font-bold">
						{currentTier?.tier} - {currentTier?.name}
					</div>
					<div className="text-base-content/70 mb-1 text-sm">Tasks Completed</div>
					<div className="text-xl font-bold text-white sm:text-2xl">5</div>
				</div>
				{nextTier && (
					<div>
						<div className="text-base-content/70 mb-2 text-sm">
							Next Tier: {nextTier.tier} - {nextTier.name}
						</div>
						<div className="text-sm">Req: {nextTier.requirement}</div>
					</div>
				)}
			</div>
		</div>
	);
}

interface SpreaderCardProps {
	claimedReferralSbts?: UserSbtData["claimedReferralSbts"];
	inviteeCount?: UserSbtData["inviteeCount"];
}

function SpreaderCard({ claimedReferralSbts, inviteeCount }: SpreaderCardProps) {
	const claimedReferralSbtsLength = claimedReferralSbts?.length || -1;
	const currentLevel = claimedReferralSbtsLength;
	const nextLevel = currentLevel + 1;
	const isNextLevelAvailable = nextLevel <= 10;
	const currentTier = ReferralSbt.tiers[currentLevel - 1];
	const nextTier = isNextLevelAvailable ? ReferralSbt.tiers[nextLevel - 1] : null;

	return (
		<div className="card">
			<div className="card-body">
				<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<Share2 className="text-success shrink-0" />
						<h3 className="font-bold">Spreader</h3>
					</div>
					<button className="btn btn-success btn-sm">Refer & Earn</button>
				</div>
				<div className="mb-4">
					<div className="text-base-content/70 mb-1 text-sm">Current Tier</div>
					<div className="text-success mb-2 font-bold">
						{currentTier?.tier} - {currentTier?.name}
					</div>
					<div className="text-base-content/70 text-sm">Verified Referrals</div>
					<div className="text-xl font-bold text-white sm:text-2xl">{inviteeCount}</div>
				</div>
				<div className="mb-4">
					<div className="text-base-content/70 mb-2 text-sm">Your Invite Link</div>
					<div className="flex items-center gap-2">
						<code className="bg-base-100 flex-1 rounded px-2 py-1 text-xs break-words">
							{/* TODO: not send by tbook currently */}
							https://native.cc/r/hive-bee-123
						</code>
						<CopyButton text="https://native.cc/r/hive-bee-123" />
					</div>
				</div>
				{nextTier && (
					<div>
						<div className="text-base-content/70 mb-2 text-sm">
							Next Tier: {nextTier.tier} - {nextTier.name}
						</div>
						<progress className="progress progress-success mb-1" value={55} max="100" />
						<div className="text-base-content/70 text-sm">Req: {nextTier.requirement}</div>
					</div>
				)}
			</div>
		</div>
	);
}

export function Dashboard() {
	const suiAccount = useCurrentAccount();
	const isSuiConnected = !!suiAccount;
	const userHiveDashboardFetcher = useFetcher<QueryUserDataResp>();
	const hiveUserDashboardData: QueryUserDataResp = userHiveDashboardFetcher.data ?? null;
	const isPageLoading = userHiveDashboardFetcher.state !== "idle";

	useEffect(() => {
		if (userHiveDashboardFetcher.state === "idle" && !hiveUserDashboardData && suiAccount) {
			makeReq<QueryUserDataResp>(userHiveDashboardFetcher, {
				method: "queryHiveUserData",
				params: [suiAccount.address],
			});
		}
	}, [hiveUserDashboardData, userHiveDashboardFetcher, suiAccount]);

	const totalRawPoints = hiveUserDashboardData?.data.totalRawPoints;
	const claimedReferralSbts = hiveUserDashboardData?.data.claimedReferralSbts;
	const claimedSocialSbts = hiveUserDashboardData?.data.claimedSocialSbts;
	const inviteeCount = hiveUserDashboardData?.data.inviteeCount;

	if (!isSuiConnected) {
		return (
			<div className="flex items-center justify-center">
				<div className="card max-w-md">
					<div className="card-body text-center">
						<Wallet className="text-primary-foreground mx-auto mb-4 h-16 w-16" />
						<h2 className="card-title justify-center">Connect Your SUI Wallet</h2>
						<p className="text-base-content/70 mb-4">
							Connect your SUI wallet to access your Hive Dashboard and track your rewards.
						</p>
						<SuiConnectModal />
					</div>
				</div>
			</div>
		);
	}

	if (isPageLoading) {
		return <DashboardSkeletonLoader />;
	}

	return (
		<div className="space-y-6">
			<HiveScoreHeader totalHiveScore={totalRawPoints} />
			<div>
				<h2 className="mb-4 text-xl font-bold">Category Breakdown</h2>
				<ContributorCard />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<MemberCard claimedSocialSbts={claimedSocialSbts} />
					<SpreaderCard claimedReferralSbts={claimedReferralSbts} inviteeCount={inviteeCount} />
				</div>
			</div>
		</div>
	);
}
