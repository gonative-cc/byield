import { CircleCheck, CirclePlus, Share2, Shield, Users } from "lucide-react";
import { CopyButton } from "~/components/ui/CopyButton";

function HiveScoreHeader() {
	return (
		<div className="card">
			<div className="card-body flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<div className="text-base-content/70 mb-1 text-sm">Total Hive Score ⚡</div>
					<div className="text-3xl font-bold text-white sm:text-5xl">4,250</div>
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
						<code className="text-xs">native.cc/r/hive-bee-123</code>
						<CopyButton text={"native.cc/r/hive-bee-123"} />
					</div>
				</div>
			</div>
		</div>
	);
}

function ContributorCard() {
	return (
		<div className="card mb-4">
			<div className="card-body">
				<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
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
						<div className="text-primary-foreground mb-2 font-bold">IV - Hive Saver</div>
						<div className="mb-1 text-xl font-bold text-white sm:text-2xl">$2,750</div>
						<div className="text-base-content/70 text-sm">Locked Liquidity</div>
					</div>
					<div>
						<div className="text-base-content/70 mb-2 text-sm">Next Tier: V - Vault Keeper</div>
						<progress className="progress progress-primary mb-1" value={55} max="100" />
						<div className="text-base-content/70 text-sm">Reach $5,000 to upgrade</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function MemberCard() {
	return (
		<div className="card">
			<div className="card-body">
				<div className="mb-4 flex items-start gap-3">
					<Users className="text-info flex-shrink-0" />
					<h3 className="font-bold">Member</h3>
				</div>
				<div className="mb-4">
					<div className="text-base-content/70 mb-1 text-sm">Current Tier</div>
					<div className="text-info mb-2 font-bold">V - BYield Profile</div>
					<div className="text-base-content/70 mb-1 text-sm">Tasks Completed</div>
					<div className="text-xl font-bold text-white sm:text-2xl">5</div>
				</div>
				<div>
					<div className="text-base-content/70 mb-2 text-sm">Next Tier: VI - Pollen Seeker</div>
					<progress className="progress progress-info mb-1" value={55} max="100" />
					<div className="text-base-content/70 text-sm">Req: Obtain Discord Role</div>
				</div>
			</div>
		</div>
	);
}

function SpreaderCard() {
	return (
		<div className="card">
			<div className="card-body">
				<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<Share2 className="text-success flex-shrink-0" />
						<h3 className="font-bold">Spreader</h3>
					</div>
					<button className="btn btn-success btn-sm">Refer & Earn</button>
				</div>
				<div className="mb-4">
					<div className="text-base-content/70 mb-1 text-sm">Current Tier</div>
					<div className="text-success mb-2 font-bold">II - Network Starter</div>
					<div className="text-base-content/70 text-sm">Verified Referrals</div>
					<div className="text-xl font-bold text-white sm:text-2xl">4</div>
				</div>
				<div className="mb-4">
					<div className="text-base-content/70 mb-2 text-sm">Your Invite Link</div>
					<div className="flex items-center gap-2">
						<code className="bg-base-100 flex-1 rounded px-2 py-1 text-xs break-all">
							https://native.cc/r/hive-bee-123
						</code>
						<CopyButton text="https://native.cc/r/hive-bee-123" />
					</div>
				</div>
				<div>
					<div className="text-base-content/70 mb-2 text-sm">Next Tier: III - Signal Booster</div>
					<progress className="progress progress-success mb-1" value={55} max="100" />
					<div className="text-base-content/70 text-sm">Req: 5 Verified Referrals</div>
				</div>
			</div>
		</div>
	);
}

export function Dashboard() {
	return (
		<div className="space-y-6">
			<HiveScoreHeader />
			<div>
				<h2 className="mb-4 text-xl font-bold">Category Breakdown</h2>
				<ContributorCard />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<MemberCard />
					<SpreaderCard />
				</div>
			</div>
		</div>
	);
}
