import { CheckCircle, XCircle } from "lucide-react";
import { type MintTransaction } from "~/server/Mint/types";
import { AnimatedHourglass } from "./AnimatedHourglass";
import { useIndexerNetwork } from "~/hooks/useBitcoinConfig";

interface ExpandableTransactionDetailsProps {
	transaction: MintTransaction;
}

export function ExpandableTransactionDetails({ transaction }: ExpandableTransactionDetailsProps) {
	const { bitcoinConfig } = useIndexerNetwork();

	if (!bitcoinConfig?.confirmationDepth) {
		return (
			<div className="p-4 bg-base-100 border-t border-base-300 text-center text-base-content/60">
				Please connect your wallet to view details
			</div>
		);
	}

	const { confirmationDepth } = bitcoinConfig;
	const isActive = ["broadcasting", "confirming", "finalized", "minting"].includes(transaction.status);
	const isComplete = transaction.status === "minted";
	const isFailed = ["failed", "reorg"].includes(transaction.status);

	return (
		<div className="p-4 bg-base-100 border-t border-base-300 space-y-3">
			<div className="flex items-center gap-2 text-sm">
				{isComplete ? (
					<CheckCircle size={16} className="text-success" />
				) : isFailed ? (
					<XCircle size={16} className="text-error" />
				) : isActive ? (
					<AnimatedHourglass size="md" />
				) : null}
				<span>
					Status: <span className="font-semibold">{transaction.status}</span>
				</span>
			</div>

			<div className="text-sm">
				<span>Confirmations: </span>
				<span className="font-mono">
					{Math.min(transaction.numberOfConfirmation, confirmationDepth)}/{confirmationDepth}
				</span>
			</div>

			<div className="text-sm text-base-content/70">
				Started: {new Date(transaction.operationStartDate || transaction.timestamp).toLocaleString()}
			</div>

			{transaction.bitcoinExplorerUrl && (
				<a
					href={transaction.bitcoinExplorerUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="link link-primary text-sm"
				>
					View Bitcoin transaction
				</a>
			)}

			{isFailed && (
				<div className="alert alert-error">
					<XCircle size={16} />
					<span>Transaction {transaction.status === "reorg" ? "reorganized" : "failed"}</span>
				</div>
			)}
		</div>
	);
}
