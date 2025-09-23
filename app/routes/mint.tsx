import { RegtestInstructions } from "~/pages/Mint/RegtestInstructions";
import { MintBTC } from "~/pages/Mint/MintBTC";
import { MintBTCTable } from "~/pages/Mint/MintBTCTable";
import { Collapse } from "~/components/ui/collapse";
import { useNbtcTxs } from "~/hooks/useNbtcTransactions";
import { RefreshCw } from "lucide-react";

function MintContent() {
	const { txs: transactions, isLoading, error, refetch, addPendingTx } = useNbtcTxs();

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
					<Collapse title="Regtest Configuration for Devnet Server" className="bg-base-200">
						<RegtestInstructions />
					</Collapse>
					<MintBTC onTransactionBroadcast={addPendingTx} />
				</div>
			</div>

			{/* Transaction Table Section */}
			<div className="space-y-4">
				<div className="flex justify-end">
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

				<MintBTCTable data={transactions} isLoading={isLoading} />
			</div>
		</div>
	);
}

export default function Mint() {
	return <MintContent />;
}
