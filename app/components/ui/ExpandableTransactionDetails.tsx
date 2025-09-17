import { Info } from "lucide-react";
import { type NbtcTxStatus, type MintTransaction } from "~/server/Mint/types";
import { AnimatedHourglass } from "./AnimatedHourglass";
import { useIndexerNetworkContext } from "~/providers/IndexerNetworkProvider";

interface ExpandableTransactionDetailsProps {
	transaction: MintTransaction;
}

export function ExpandableTransactionDetails({ transaction }: ExpandableTransactionDetailsProps) {
	const { bitcoinConfig } = useIndexerNetworkContext();
	const confirmationThreshold = bitcoinConfig?.confirmationThreshold || 3; // Default to 3 for testnet-v2
	const blockTime = bitcoinConfig?.blockTime || 120; // Default 2 minutes for testnet-v2
	const operationDate = new Date(transaction.operationStartDate || transaction.timestamp);

	const getStatusIcon = (status: NbtcTxStatus) => {
		switch (status) {
			case "confirming":
				return <AnimatedHourglass />;
			case "finalized":
			case "minted":
				return null;
			case "failed":
			case "reorg":
				return null;
			default:
				return null;
		}
	};

	const getConfirmationIcon = () => {
		if (transaction.status === "confirming" && transaction.numberOfConfirmation === 0) {
			return null;
		}
		return transaction.numberOfConfirmation >= confirmationThreshold ? null : <AnimatedHourglass />;
	};

	const getBitcoinTxStatus = () => {
		switch (transaction.status) {
			case "confirming":
				return transaction.numberOfConfirmation === 0
					? "Bitcoin Tx broadcasting"
					: "Bitcoin Tx broadcasted";
			case "finalized":
			case "minted":
				return "Bitcoin Tx broadcasted";
			case "failed":
			case "reorg":
				return "Bitcoin Tx Broadcast failed";
			default:
				return "Bitcoin Tx status unknown";
		}
	};

	const getSuiMintingStatus = () => {
		switch (transaction.status) {
			case "confirming":
			case "finalized":
				return "nBTC minting";
			case "minted":
				return "nBTC minted";
			case "failed":
			case "reorg":
				return "nBTC minting";
			default:
				return "nBTC minting";
		}
	};

	const getSuiMintingIcon = () => {
		switch (transaction.status) {
			case "minted":
				return null;
			case "failed":
			case "reorg":
				return null;
			default:
				return <AnimatedHourglass />;
		}
	};

	const isTransactionBroadcasting = () => {
		return transaction.status === "confirming" && transaction.numberOfConfirmation === 0;
	};

	const estimatedTimeRemaining = () => {
		if (transaction.status !== "confirming") return null;
		const remainingConfirmations = Math.max(0, confirmationThreshold - transaction.numberOfConfirmation);
		const estimatedMinutes = remainingConfirmations * (blockTime / 60);
		return Math.ceil(estimatedMinutes);
	};

	return (
		<div className="p-6 bg-base-100 border-t border-base-300">
			<div className="space-y-4">
				{/* Operation Start */}
				<div className="text-sm text-base-content/70">
					<span className="font-semibold">Operation start:</span> {operationDate.toLocaleString()}
				</div>

				<div className="divider my-2"></div>

				{/* Bitcoin Transaction Status */}
				<div className="flex items-center gap-2 text-sm">
					<span className="flex items-center gap-1">
						{getStatusIcon(transaction.status)} {getBitcoinTxStatus()}
					</span>
					{transaction.bitcoinExplorerUrl && !isTransactionBroadcasting() && (
						<a
							href={transaction.bitcoinExplorerUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="link link-primary"
						>
							[transaction]
						</a>
					)}
				</div>

				{/* Bitcoin Confirmations */}
				<div className="flex items-start gap-2 text-sm">
					<span className="flex items-center gap-1">
						{getConfirmationIcon()} Bitcoin confirmations: {transaction.numberOfConfirmation}/
						{confirmationThreshold}
					</span>
					{transaction.status === "confirming" && estimatedTimeRemaining() && (
						<span className="text-base-content/60">
							[~{estimatedTimeRemaining()} minutes remaining]
						</span>
					)}
				</div>

				{/* Info about Bitcoin confirmations */}
				<div className="alert">
					<Info size={16} className="flex-shrink-0" />
					<span className="text-xs">
						Bitcoin requires confirmations to ensure that a transaction is final and irreversible,
						preventing double-spending. Confirmation is a Bitcoin Block minted after that
						transaction. 1 bitcoin block takes about {blockTime / 60} minutes.
					</span>
				</div>

				{/* Sui Minting Status */}
				<div className="flex items-center gap-2 text-sm">
					<span className="flex items-center gap-1">
						{getSuiMintingIcon()} {getSuiMintingStatus()}
					</span>
					{transaction.suiTxId && (
						<a
							href={transaction.suiExplorerUrl || `#${transaction.suiTxId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="link link-primary"
						>
							[Sui Tx ID]
						</a>
					)}
				</div>

				<div className="divider my-2"></div>

				{/* Fees */}
				<div className="text-sm text-base-content/70">
					<span className="font-semibold">Fees:</span> {transaction.fees || 5} sats
				</div>

				{/* Error message for failed transactions */}
				{(transaction.status === "failed" || transaction.status === "reorg") && (
					<div className="alert">
						<div>
							<div className="font-medium mb-1">
								Transaction {transaction.status === "reorg" ? "Reorganized" : "Failed"}
							</div>
							<div className="text-sm opacity-80">
								{transaction.errorMessage ||
									(transaction.status === "reorg"
										? "The transaction was reorganized due to a blockchain reorganization"
										: "The transaction failed to be included in the block (the transaction didn't happen)")}
							</div>
							<button className="btn btn-sm mt-2">
								{transaction.status === "reorg" ? "Retry Transaction" : "Retry Transaction"}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
