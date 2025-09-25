import { Info, CheckCircle, XCircle } from "lucide-react";
import { type MintTransaction, MintingStatus } from "~/server/Mint/types";
import { AnimatedHourglass } from "~/components/ui/AnimatedHourglass";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { NumericFormat } from "react-number-format";
import { formatBTC } from "~/lib/denoms";

interface FailedTransactionAlertProps {
	transaction: MintTransaction;
}

function FailedTransactionAlert({ transaction }: FailedTransactionAlertProps) {
	return (
		<div className="alert alert-error">
			<XCircle size={16} className="flex-shrink-0" />
			<div>
				<div className="font-medium mb-1">
					Transaction {transaction.status === MintingStatus.Reorg ? "Reorganized" : "Failed"}
				</div>
				<div className="text-sm opacity-80">
					{transaction.errorMessage ||
						(transaction.status === MintingStatus.Reorg
							? "The transaction was reorganized due to a blockchain reorganization"
							: "The transaction was not included in the block (the transaction didn't happen)")}
				</div>
				<button className="btn btn-sm btn-error mt-2">Retry Transaction</button>
			</div>
		</div>
	);
}

interface ExpandableTransactionDetailsProps {
	transaction: MintTransaction;
}

export function ExpandableTransactionDetails({ transaction }: ExpandableTransactionDetailsProps) {
	const bitcoinConfig = useBitcoinConfig();

	if (!bitcoinConfig?.confirmationDepth || !bitcoinConfig?.blockTimeSec) {
		return (
			<div className="p-6 bg-base-100 border-t border-base-300">
				<div className="text-center text-base-content/60">
					Please connect your wallet to view transaction details
				</div>
			</div>
		);
	}

	const confirmationDepth = bitcoinConfig.confirmationDepth;
	const blockTime = bitcoinConfig.blockTimeSec;
	const operationDate = new Date(transaction.operationStartDate || transaction.timestamp);

	const estimatedTimeRemaining = () => {
		if (
			transaction.status !== MintingStatus.Confirming &&
			transaction.status !== MintingStatus.Broadcasting
		)
			return null;
		const remainingConfirmations = Math.max(0, confirmationDepth - transaction.numberOfConfirmation);
		const estimatedMinutes = remainingConfirmations * (blockTime / 60);
		return Math.ceil(estimatedMinutes);
	};

	const formatTimeRemaining = (minutes: number | null) => {
		if (!minutes || minutes <= 0) return null;
		if (minutes === 1) return "~1 minute";
		return `~${minutes} minutes`;
	};

	const isBroadcasted = transaction.status !== MintingStatus.Broadcasting;
	const isConfirmed = transaction.numberOfConfirmation >= confirmationDepth;
	const isMinted = transaction.status === MintingStatus.Minted;
	const isFailed =
		transaction.status === MintingStatus.Failed || transaction.status === MintingStatus.Reorg;
	const showTimeRemaining =
		!isConfirmed &&
		(transaction.status === MintingStatus.Confirming ||
			transaction.status === MintingStatus.Broadcasting) &&
		estimatedTimeRemaining();

	return (
		<div className="p-6 bg-base-100 border-t border-base-300">
			<div className="space-y-4">
				<div className="text-sm text-base-content/70">
					<span className="font-semibold">Operation start:</span> {operationDate.toLocaleString()}
				</div>

				<div className="divider my-2"></div>

				<div className="flex items-center gap-2 text-sm">
					{isFailed ? (
						<XCircle size={16} className="text-error flex-shrink-0" />
					) : isBroadcasted ? (
						<CheckCircle size={16} className="text-success flex-shrink-0" />
					) : (
						<AnimatedHourglass size="md" />
					)}
					<span>
						{isFailed
							? "Bitcoin Tx Broadcast failed"
							: isBroadcasted
								? "Bitcoin Tx broadcasted"
								: "Bitcoin Tx broadcasting"}
					</span>
					{transaction.bitcoinExplorerUrl && isBroadcasted && (
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

				<div className="flex items-center gap-2 text-sm">
					{isFailed ? null : isConfirmed ? (
						<CheckCircle size={16} className="text-success flex-shrink-0" />
					) : transaction.numberOfConfirmation > 0 ? (
						<AnimatedHourglass size="md" />
					) : null}
					<span>
						Bitcoin confirmations:{" "}
						{isFailed ? 0 : Math.min(transaction.numberOfConfirmation, confirmationDepth)}/
						{confirmationDepth}
					</span>
					{showTimeRemaining && (
						<span className="text-base-content/60">
							[{formatTimeRemaining(estimatedTimeRemaining())}]
						</span>
					)}
				</div>

				<div className="alert">
					<Info size={16} className="flex-shrink-0" />
					<span className="text-xs">
						Bitcoin requires confirmations to ensure that a transaction is final and irreversible,
						preventing double-spending. Confirmation is a Bitcoin Block minted after that
						transaction. 1 bitcoin block takes about {blockTime / 60} minutes.
					</span>
				</div>

				<div className="flex items-center gap-2 text-sm">
					{isMinted ? (
						<CheckCircle size={16} className="text-success flex-shrink-0" />
					) : isFailed ? (
						<XCircle size={16} className="text-error flex-shrink-0" />
					) : isConfirmed ? (
						<AnimatedHourglass size="md" />
					) : null}
					<span>{isMinted ? "nBTC minted" : isConfirmed ? "nBTC minting" : "nBTC minting"}</span>
				</div>

				<div className="divider my-2"></div>

				<div className="text-sm text-base-content/70">
					<span className="font-semibold">Fees:</span> {transaction.fees ?? "-"} sats{" "}
					<span className="text-base-content/50">
						(~
						<NumericFormat
							displayType="text"
							value={transaction.fees != null ? formatBTC(BigInt(transaction.fees)) : "-"}
							suffix=" BTC"
							className="font-mono"
						/>
						)
					</span>
				</div>

				{isFailed && <FailedTransactionAlert transaction={transaction} />}
			</div>
		</div>
	);
}
