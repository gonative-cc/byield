import { Info } from "lucide-react";
import { MintingTxStatus, type MintTransaction } from "~/server/Mint/types";
import { AnimatedHourglass } from "./AnimatedHourglass";
import { useBitcoinConfig, type BitcoinConfigBase } from "~/hooks/useBitcoinConfig";

interface ExpandableTransactionDetailsProps {
	transaction: MintTransaction;
}

export function ExpandableTransactionDetails({ transaction }: ExpandableTransactionDetailsProps) {
	const bitcoinConfig = useBitcoinConfig();
	const confirmationThreshold = bitcoinConfig?.confirmationThreshold || 6;
	const blockTime = (bitcoinConfig as BitcoinConfigBase)?.blockTime || 600; // Default 10 minutes in seconds
	const operationDate = new Date(transaction.operationStartDate || transaction.timestamp);

	const getStatusIcon = (status: MintingTxStatus) => {
		switch (status) {
			case MintingTxStatus.BROADCASTING:
				return <AnimatedHourglass />;
			case MintingTxStatus.CONFIRMING:
				return "✅";
			case MintingTxStatus.MINTING:
				return <AnimatedHourglass />;
			case MintingTxStatus.MINTED:
				return "✅";
			case MintingTxStatus.FAILED:
				return "❌";
			default:
				return "🕓";
		}
	};

	const getConfirmationIcon = () => {
		if (transaction.status === MintingTxStatus.BROADCASTING) {
			return "🕓";
		}
		return transaction.numberOfConfirmation >= confirmationThreshold ? "✅" : <AnimatedHourglass />;
	};

	const getBitcoinTxStatus = () => {
		switch (transaction.status) {
			case MintingTxStatus.BROADCASTING:
				return "Bitcoin Tx broadcasting";
			case MintingTxStatus.CONFIRMING:
			case MintingTxStatus.MINTING:
			case MintingTxStatus.MINTED:
				return "Bitcoin Tx broadcasted";
			case MintingTxStatus.FAILED:
				return "Bitcoin Tx Broadcast failed";
			default:
				return "Bitcoin Tx status unknown";
		}
	};

	const getSuiMintingStatus = () => {
		switch (transaction.status) {
			case MintingTxStatus.MINTING:
				return "nBTC minting";
			case MintingTxStatus.MINTED:
				return "nBTC minted";
			default:
				return "nBTC minting";
		}
	};

	return (
		<div className="p-6 bg-base-200 border-t border-base-300">
			<div className="space-y-4">
				{/* Operation Start */}
				<div className="text-sm text-base-content/80">
					<strong>Operation start:</strong> {operationDate.toLocaleString()}
				</div>

				<hr className="border-base-300" />

				{/* Bitcoin Transaction Status */}
				<div className="flex items-center gap-2 text-sm">
					<span className="flex items-center gap-1">
						{getStatusIcon(transaction.status)} {getBitcoinTxStatus()}
					</span>
					{transaction.bitcoinExplorerUrl &&
						transaction.status !== MintingTxStatus.BROADCASTING && (
							<a
								href={transaction.bitcoinExplorerUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
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
					{transaction.status === MintingTxStatus.CONFIRMING && (
						<span className="text-base-content/60">[countdown in minutes]</span>
					)}
				</div>

				{/* Info about Bitcoin confirmations */}
				<div className="flex items-start gap-2 text-xs text-base-content/60 bg-base-300/50 p-3 rounded">
					<Info size={16} className="mt-0.5 flex-shrink-0" />
					<span>
						Bitcoin requires confirmations to ensure that a transaction is final and irreversible,
						preventing double-spending. Confirmation is a Bitcoin Block minted after that
						transaction. 1 bitcoin block takes about {blockTime / 60} minutes.
					</span>
				</div>

				{/* Sui Minting Status */}
				<div className="flex items-center gap-2 text-sm">
					<span className="flex items-center gap-1">
						{transaction.status === MintingTxStatus.MINTING ? (
							<AnimatedHourglass />
						) : transaction.status === MintingTxStatus.MINTED ? (
							"✅"
						) : (
							"🕓"
						)}
						{getSuiMintingStatus()}
					</span>
					{transaction.suiTxId && (
						<a
							href={transaction.suiExplorerUrl || `#${transaction.suiTxId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							[Sui Tx ID]
						</a>
					)}
				</div>

				<hr className="border-base-300" />

				{/* Fees */}
				<div className="text-sm text-base-content/80">
					<strong>Fees:</strong> {transaction.fees || 5} sats
				</div>

				{/* Error message for failed transactions */}
				{transaction.status === MintingTxStatus.FAILED && (
					<div className="mt-4 p-3 bg-error/10 border border-error/20 rounded">
						<div className="text-error text-sm font-medium mb-2">❌ Transaction Failed</div>
						<div className="text-sm text-error/80">
							{transaction.errorMessage ||
								"The transaction failed to be included in the block (the transaction didn't happen)"}
						</div>
						<button className="mt-2 btn btn-sm btn-error">Retry Transaction</button>
					</div>
				)}
			</div>
		</div>
	);
}
