import { RegtestInstructions } from "~/pages/Mint/RegtestInstructions";
import { MintBTC } from "~/pages/Mint/MintBTC";
import { MintBTCTable } from "~/pages/Mint/MintBTCTable";
import { useNbtcTransactions } from "~/hooks/useNbtcTransactions";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { RefreshCw } from "lucide-react";

function MintContent() {
	const { transactions, isLoading, error, refetch, addPendingTransaction } = useNbtcTransactions();

	return (
		<div className="mx-auto px-4 py-4 space-y-6">
			<div className="text-center space-y-4">
				<div className="space-y-2">
					<span className="text-4xl">
						Mint<span className="text-primary"> nBTC</span>
					</span>
					<p className="text-muted-foreground text-lg">
						Deposit Bitcoin and mint native Bitcoin tokens on Sui network
					</p>
				</div>
			</div>

			<div className="flex justify-center">
				<div className="w-full max-w-xl space-y-6">
					<RegtestInstructions />
					<MintBTC onTransactionBroadcast={addPendingTransaction} />
				</div>
			</div>

			{/* Transaction Table Section */}
			<div className="space-y-4">
				{/* Table Header with Refresh Button */}
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold flex items-center gap-2">
						<span>₿</span>
						<span>nBTC Mint Transactions</span>
					</h2>
					<button
						onClick={refetch}
						disabled={isLoading}
						className="btn btn-sm btn-ghost flex items-center gap-2 hover:bg-base-200"
						title="Refresh transactions"
					>
						<RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
						Refresh
					</button>
				</div>

				{error && (
					<div className="alert">
						<div>
							<div className="font-medium">Failed to load transactions</div>
							<div className="text-sm opacity-80">{error}</div>
							<button onClick={refetch} className="btn btn-sm mt-2">
								Retry
							</button>
						</div>
					</div>
				)}

				{isLoading ? (
					<div className="flex justify-center py-8">
						<div className="flex flex-col items-center gap-4">
							<LoadingSpinner isLoading={isLoading} />
							<p className="text-base-content/60">Loading nBTC transactions...</p>
						</div>
					</div>
				) : (
					<MintBTCTable data={transactions} />
				)}
			</div>
		</div>
	);
}

export default function Mint() {
	return <MintContent />;
}