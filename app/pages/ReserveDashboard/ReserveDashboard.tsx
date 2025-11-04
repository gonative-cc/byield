import { Info, ShieldCheck } from "lucide-react";

interface NBTCProofOfReserveProps {
	totalLockedBTC?: number;
	totalMintedNBTC?: number;
	lastRefresh?: string;
}

function Header({ lastRefresh }: { lastRefresh: string }) {
	return (
		<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3">
				<div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
					<ShieldCheck />
				</div>
				<div>
					<h1 className="text-xl font-bold">Native nBTC Proof of Reserves</h1>
					<div className="text-base-content/70 mt-1 flex items-center gap-2 text-sm">
						<span>STATUS: Fully backed</span>
					</div>
				</div>
			</div>
			<div className="text-base-content/75 text-sm sm:text-right">Last Refresh: {lastRefresh}</div>
		</div>
	);
}

export const ReserveDashboard = ({
	totalLockedBTC = 1250.45,
	totalMintedNBTC = 1250.4,
	lastRefresh = "1m ago",
}: NBTCProofOfReserveProps) => {
	return (
		<div className="mx-auto space-y-6 p-6 sm:p-8">
			<Header lastRefresh={lastRefresh} />
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div className="card">
					<div className="card-body">
						<p className="text-base-content/60 mb-2 text-sm font-medium tracking-wide uppercase">
							Total BTC Locked (Reserves)
						</p>
						<p className="text-primary text-3xl font-bold sm:text-4xl">
							{totalLockedBTC.toLocaleString()} BTC
						</p>
						<a href="#" className="link link-primary inline-block text-sm hover:underline">
							View on Bitcoin Explorer
						</a>
						<div className="divider mt-6 pt-4" />
						<div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
							<div className="bg-primary h-5 w-5 rounded-full"></div>
							<h3 className="text-base-content text-sm font-semibold sm:text-base">
								Bitcoin dWallet UTXOs (Reserve)
							</h3>
						</div>
						<p className="text-base-content/75 text-sm break-all">Address: bc1q_dwalle</p>
					</div>
				</div>

				{/* Liability Card */}
				<div className="card">
					<div className="card-body">
						<p className="text-base-content/60 mb-2 text-sm font-medium tracking-wide uppercase">
							Total nBTC Minted (Liability)
						</p>
						<p className="text-primary text-3xl font-bold sm:text-4xl">
							{totalMintedNBTC.toLocaleString()} nBTC
						</p>
						<a href="#" className="link link-primary inline-block text-sm hover:underline">
							View on Sui Explorer
						</a>
						<div className="divider mt-6 pt-4" />
						<div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
							<div className="bg-secondary h-5 w-5 rounded-full"></div>
							<h3 className="text-base-content text-sm font-semibold sm:text-base">
								nBTC Mint Contracts (Liability)
							</h3>
						</div>
						<p className="text-base-content/75 text-sm break-all">Contract: 0x_nbtc_contract</p>
					</div>
				</div>
			</div>

			{/* How to Verify Manually */}
			<span className="alert alert-info">
				<Info />
				Verify reserves by querying the Bitcoin dWallet address. Verify liabilities by querying the
				nBTC contract on Sui.
			</span>
		</div>
	);
};
