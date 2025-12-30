import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { CircleCheck, CirclePlus, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { CopyButton } from "~/components/ui/CopyButton";
import { DashboardSkeletonLoader } from "~/pages/Hive/SkeletonLoader";
import { SuiConnectModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { LockDropSbt, ReferralSbt, SocialSbt } from "./constant";
import { makeReq, type QueryUserDataResp } from "~/server/hive/jsonrpc";
import type { UserSbtData } from "~/server/hive/types";
import { DepositModal } from "./DepositModal";
import { getUserDeposits } from "./lockdrop-transactions";
import { useNetworkVariables } from "~/networkConfig";
import { formatUSDC, parseUSDC } from "~/lib/denoms";
import type { TabType } from "./types";
import { ReadMoreFAQ } from "./Home";

interface HiveScoreHeaderProps {
	totalHiveScore?: number;
}

function HiveScoreHeader({ totalHiveScore }: HiveScoreHeaderProps) {
	return (
		<div className="card">
			<div className="card-body flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<div className="text-muted-foreground mb-1 text-sm">Total Hive Score ⚡</div>
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
				</div>
			</div>
		</div>
	);
}

interface ContributorCardProps {
	redirectTab: (redirectTab: TabType) => void;
	lockdropClaimedSbt?: UserSbtData["claimedLockdropSbts"];
}

function ContributorCard({ redirectTab, lockdropClaimedSbt = [] }: ContributorCardProps) {
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { lockdrop } = useNetworkVariables();
	const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
	const [userTotalDeposit, setUserTotalDeposit] = useState<{
		totalDeposit?: string | null;
		isError?: boolean;
	}>({ totalDeposit: null, isError: false });
	const isUserDepositError = userTotalDeposit?.isError;

	const claimedLockdropSbtsLength = lockdropClaimedSbt.length;
	const isLockdropSbtClaimed = claimedLockdropSbtsLength >= 1;
	const currentLevel = claimedLockdropSbtsLength;
	const nextLevel = currentLevel + 1;
	const isNextLevelAvailable = nextLevel <= 10;
	const currentTier = LockDropSbt.tiers[currentLevel - 1];
	const nextTier = isNextLevelAvailable ? LockDropSbt.tiers[nextLevel - 1] : null;

	useEffect(() => {
		async function fetchUserTotalDeposit() {
			if (account?.address) {
				const totalDeposit = await getUserDeposits(account.address, lockdrop, client);
				if (totalDeposit !== null)
					setUserTotalDeposit({ totalDeposit: formatUSDC(totalDeposit || "0"), isError: false });
				else setUserTotalDeposit({ totalDeposit: null, isError: true });
			}
		}
		fetchUserTotalDeposit();
	}, [account, client, lockdrop]);

	return (
		<div className="card mb-4">
			<div className="card-body">
				<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<img
							src="/assets/lockdrop/SocialSBT.svg"
							alt="Hive Contributor SBTs"
							className="h-10 w-10"
						/>
						<div>
							<h3 className="font-bold">Hive Contributor SBTs</h3>
							<span>
								Commit USDC to the Genesis Lockdrop. <ReadMoreFAQ />
							</span>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<div className="text-muted-foreground mb-1 text-sm">Current Tier</div>
						{isLockdropSbtClaimed ? (
							<>
								<div className="text-primary-foreground mb-1 font-bold">
									{currentTier.tier} - {currentTier.name}
								</div>
								<div className="text-muted-foreground mb-4 text-sm">
									{currentTier.description}
								</div>
							</>
						) : (
							<span>No Lockdrop SBTs claimed</span>
						)}
						{userTotalDeposit?.totalDeposit !== null && (
							<>
								<div className="mt-4 mb-1 text-xl font-bold text-white sm:text-2xl">
									{isUserDepositError
										? "Error fetching user deposit"
										: `$${userTotalDeposit?.totalDeposit}`}
								</div>
								<div className="text-muted-foreground text-sm">Locked Liquidity</div>
							</>
						)}
					</div>
					{nextTier && (
						<div className="card card-body bg-base-100">
							<div className="flex w-full justify-between">
								<span className="text-muted-foreground mb-2 text-sm">
									Next Tier: {nextTier.tier} - {nextTier.name}
								</span>
								{userTotalDeposit?.totalDeposit !== null && (
									<span className="text-muted-foreground mb-2 text-sm">
										${userTotalDeposit?.totalDeposit} / ${nextTier.usdRequired}
									</span>
								)}
							</div>
							{userTotalDeposit?.totalDeposit !== null && (
								<progress
									className="progress progress-primary mb-1"
									value={userTotalDeposit?.totalDeposit}
									max={nextTier.usdRequired}
								/>
							)}
							<div className="text-sm">{nextTier.requirement}</div>
						</div>
					)}
				</div>
				<div className="mt-4 flex flex-col items-center gap-2">
					<button
						className="btn btn-primary btn-xl btn-block lg:w-1/2"
						onClick={() => setIsDepositModalOpen(true)}
					>
						<CirclePlus /> Deposit USDC
					</button>
					<div className="text-base-content/50 text-center text-xs sm:text-right">
						Deposits go to the Lockdrop Escrow.
					</div>
				</div>
			</div>
			<DepositModal
				id="deposit-assets-modal"
				open={isDepositModalOpen}
				onClose={() => setIsDepositModalOpen(false)}
				redirectTab={redirectTab}
				updateDeposit={(newDeposit: bigint) => {
					setUserTotalDeposit((prev) => {
						if (prev?.totalDeposit) {
							const total = parseUSDC(prev.totalDeposit) + newDeposit;
							return { totalDeposit: formatUSDC(total), isError: false };
						}
						return { totalDeposit: formatUSDC(newDeposit), isError: false };
					});
				}}
			/>
		</div>
	);
}

interface MemberCardProps {
	claimedSocialSbts?: UserSbtData["claimedSocialSbts"];
}

function MemberCard({ claimedSocialSbts = [] }: MemberCardProps) {
	const claimedSocialSbtsLength = claimedSocialSbts.length;
	const isSocialSbtClaimed = claimedSocialSbtsLength >= 1;
	const currentLevel = claimedSocialSbtsLength;
	const nextLevel = currentLevel + 1;
	const isNextLevelAvailable = nextLevel <= 10;
	const currentTier = SocialSbt.tiers[currentLevel - 1];
	const nextTier = isNextLevelAvailable ? SocialSbt.tiers[nextLevel - 1] : null;

	return (
		<div className="card">
			<div className="card-body">
				<div className="flex items-start gap-3">
					<img
						src="/assets/lockdrop/LockdropSBT.svg"
						alt="Hive Member SBTs"
						className="h-10 w-10"
					/>
					<div>
						<h3 className="font-bold">Hive Member SBTs</h3>
						<span>
							Link your identities and verify your social presence. <ReadMoreFAQ />
						</span>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<div className="text-muted-foreground mb-1 text-sm">Current Tier</div>
						{isSocialSbtClaimed ? (
							<>
								<div className="text-info mb-2 font-bold">
									{currentTier.tier} - {currentTier.name}
								</div>
								<div className="text-muted-foreground text-sm">{currentTier.description}</div>
							</>
						) : (
							<span>No Social SBTs claimed</span>
						)}
					</div>
					{nextTier && (
						<div className="card card-body bg-base-100">
							<div className="text-muted-foreground mb-2 text-sm">
								Next Tier: {nextTier.tier} - {nextTier.name}
							</div>
							<div className="text-sm">Requirement: {nextTier.requirement}</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

interface SpreaderCardProps {
	claimedReferralSbts?: UserSbtData["claimedReferralSbts"];
	inviteeCount?: UserSbtData["inviteeCount"];
	referralLink?: UserSbtData["referralLink"];
}

function SpreaderCard({ claimedReferralSbts = [], inviteeCount = 0, referralLink }: SpreaderCardProps) {
	const claimedReferralSbtsLength = claimedReferralSbts.length;
	const isReferralSbtClaimed = claimedReferralSbtsLength >= 1;
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
						<img
							src="/assets/lockdrop/ReferralSBT.svg"
							alt="Hive Spreader SBTs"
							className="h-10 w-10"
						/>
						<div>
							<h3 className="font-bold">Hive Spreader SBTs</h3>
							<span>
								Refer high-quality, verified users who also contribute. <ReadMoreFAQ />
							</span>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div className="mb-4">
						<div className="text-muted-foreground mb-1 text-sm">Current Tier</div>
						{isReferralSbtClaimed ? (
							<div className="text-success mb-2 font-bold">
								{currentTier?.tier} - {currentTier?.name}
							</div>
						) : (
							<span>No Referral SBTs claimed</span>
						)}
					</div>
					{nextTier && (
						<div className="card card-body bg-base-100">
							<div className="flex w-full justify-between">
								<span className="text-muted-foreground mb-2 text-sm">
									Next Tier: {nextTier.tier} - {nextTier.name}
								</span>
								<span className="text-muted-foreground mb-2 text-sm">
									{inviteeCount} / {nextTier.requirement}
								</span>
							</div>
							<progress
								className="progress progress-success mb-1"
								value={inviteeCount}
								max={nextTier.requirement}
							/>
							<div className="text-sm">Requirement: {nextTier.requirement}</div>
						</div>
					)}
				</div>
				{referralLink && (
					<div className="card card-body bg-base-100 mb-4 w-fit">
						<div className="text-muted-foreground mb-2 text-sm">Your Invite Code</div>
						<div className="flex w-fit items-center gap-2">
							<span className="bg-base-100 flex-1 rounded px-2 text-xl">
								{new URL(referralLink).searchParams.get("code")}
							</span>
							<CopyButton text={referralLink} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

interface DashboardProps {
	redirectTab: (redirectTab: TabType) => void;
}

export function Dashboard({ redirectTab }: DashboardProps) {
	const suiAccount = useCurrentAccount();
	const isSuiConnected = !!suiAccount;
	const userHiveDashboardFetcher = useFetcher<QueryUserDataResp>();
	const hiveUserDashboardData: QueryUserDataResp = userHiveDashboardFetcher.data ?? null;
	const hiveUserDashboardError =
		userHiveDashboardFetcher?.state === "idle" && userHiveDashboardFetcher.data === undefined;
	const isPageLoading = userHiveDashboardFetcher.state !== "idle";

	const fetchHiveUserData = useCallback(() => {
		if (suiAccount) {
			makeReq<QueryUserDataResp>(userHiveDashboardFetcher, {
				method: "queryHiveUserData",
				params: [suiAccount.address!],
			});
		}
	}, [suiAccount, userHiveDashboardFetcher]);

	useEffect(() => {
		if (userHiveDashboardFetcher.state === "idle" && !hiveUserDashboardData && suiAccount) {
			fetchHiveUserData();
		}
	}, [hiveUserDashboardData, userHiveDashboardFetcher, suiAccount, fetchHiveUserData]);

	const totalRawPoints = hiveUserDashboardData?.data?.totalRawPoints;
	const claimedReferralSbts = hiveUserDashboardData?.data?.claimedReferralSbts;
	const claimedSocialSbts = hiveUserDashboardData?.data?.claimedSocialSbts;
	const claimedLockdropSbts = hiveUserDashboardData?.data?.claimedLockdropSbts;
	const inviteeCount = hiveUserDashboardData?.data?.inviteeCount;
	const referralLink = hiveUserDashboardData?.data?.referralLink;

	if (!isSuiConnected) {
		return (
			<div className="flex items-center justify-center">
				<div className="card max-w-md">
					<div className="card-body text-center">
						<Wallet className="text-primary-foreground mx-auto mb-4 h-16 w-16" />
						<h2 className="card-title justify-center">Connect Your SUI Wallet</h2>
						<p className="text-muted-foreground mb-4">
							Connect your SUI wallet to access your Hive Dashboard and track your rewards.
						</p>
						<SuiConnectModal />
					</div>
				</div>
			</div>
		);
	}

	if (isPageLoading) return <DashboardSkeletonLoader />;

	if (hiveUserDashboardError) {
		return (
			<div className="flex items-center justify-center">
				<div className="card max-w-md">
					<div className="card-body text-center">
						<div className="text-error mx-auto mb-4 text-6xl">⚠️</div>
						<h2 className="card-title justify-center">Unable to Load Dashboard</h2>
						<p className="text-muted-foreground mb-4">
							There was an error loading your Hive Dashboard. Please try again.
						</p>
						<button className="btn btn-primary" onClick={fetchHiveUserData}>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<HiveScoreHeader totalHiveScore={totalRawPoints} />
			<div>
				<h2 className="mb-4 text-xl font-bold">Category Breakdown</h2>
				<ContributorCard redirectTab={redirectTab} lockdropClaimedSbt={claimedLockdropSbts} />
				<div className="grid grid-cols-1 gap-4">
					<MemberCard claimedSocialSbts={claimedSocialSbts} />
					<SpreaderCard
						claimedReferralSbts={claimedReferralSbts}
						inviteeCount={inviteeCount}
						referralLink={referralLink}
					/>
				</div>
			</div>
		</div>
	);
}
