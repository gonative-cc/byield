import { Info, CheckCircle, XCircle } from "lucide-react";
import { MintTxStatus } from "@gonative-cc/btcindexer/models";

import { type MintTransaction } from "~/server/nbtc/types";
import { AnimatedHourglass } from "~/components/ui/AnimatedHourglass";
import { Tooltip } from "~/components/ui/tooltip";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { NumericFormat } from "react-number-format";
import { formatBTC } from "~/lib/denoms";
import { infoBoxClasses } from "~/util/tailwind";

interface FailedTransactionAlertProps {
	transaction: MintTransaction;
}

function PostConfirmationFailureAlert() {
	return (
		<div className={`${infoBoxClasses()} space-y-3`}>
			<div className="flex items-start gap-3">
				<XCircle size={16} className="text-primary mt-0.5 shrink-0" />
				<div className="flex-1 space-y-3">
					<div className="text-primary font-medium">
						Transaction Failed - Manual Resolution Required
					</div>

					<div className="text-sm">
						Your Bitcoin transaction was successfully confirmed on the blockchain, but the nBTC
						minting process failed on the Sui network. This typically occurs when the SPV Light
						Client encounters an issue while verifying the transaction&#39;s inclusion in a block.
					</div>

					<div className="space-y-2">
						<div className="text-sm font-medium">What happened:</div>
						<ul className="list-inside list-disc space-y-1 text-sm">
							<li>Your BTC was successfully broadcasted, mined and confirmed</li>
							<li>The Sui network failed to mint your nBTC tokens</li>
							<li>
								Your BTC is currently held in our deposit address, consider your funds safe
							</li>
						</ul>
					</div>

					<div className="space-y-2">
						<div className="text-sm font-medium">Why this happens:</div>
						<div className="text-sm">
							This failure occurs on the Sui, usually due to network congestion or SPV Light
							client synchronization issues.
						</div>
					</div>

					<div className="space-y-2">
						<div className="text-sm font-medium">Next steps:</div>
						<div className="text-sm">
							The minting will be re-attempted shortly, if the problem persists after a few
							hours, please create a Post on &#34;general-feedback&#34; channel, with the tag
							&#34;Testnet Support/Bug&#34;. Our support team will process your request ASAP.
						</div>
						<a
							href="https://discord.com/channels/1262723650424016946/1388137313527267371"
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-sm btn-primary mt-2"
						>
							Contact Support on Discord
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

function SimpleErrorAlert({ title, message }: { title: string; message: string }) {
	return (
		<div className={infoBoxClasses()}>
			<div className="flex items-start gap-3">
				<XCircle size={16} className="text-primary mt-0.5 shrink-0" />
				<div className="space-y-3">
					<div>
						<div className="text-primary mb-1 font-medium">{title}</div>
						<div className="text-sm">{message}</div>
					</div>
					<a
						href="https://discord.com/channels/1262723650424016946/1388137313527267371"
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-sm btn-primary"
					>
						Contact Mods on Discord
					</a>
				</div>
			</div>
		</div>
	);
}

function FailedTransactionAlert({ transaction }: FailedTransactionAlertProps) {
	const isPostConfirmationFailure =
		transaction.numberOfConfirmation >= 4 &&
		transaction.status === MintTxStatus.MintFailed &&
		!transaction.suiTxId;

	const isBroadcastFailure =
		transaction.numberOfConfirmation === 0 && transaction.status === MintTxStatus.MintFailed;

	const isReorgFailure = transaction.status === MintTxStatus.Reorg;

	if (isPostConfirmationFailure) {
		return <PostConfirmationFailureAlert />;
	}

	if (isBroadcastFailure) {
		return (
			<SimpleErrorAlert
				title="Transaction Broadcast Failed"
				message={
					transaction.errorMessage ||
					"The Bitcoin transaction failed to broadcast to the network. Your BTC was not sent."
				}
			/>
		);
	}

	if (isReorgFailure) {
		return (
			<SimpleErrorAlert
				title="Transaction Reorganized"
				message={
					transaction.errorMessage ||
					"The block that your transaction was mined in is no longer part of the heaviest chain due to a Bitcoin reorg"
				}
			/>
		);
	}

	return null;
}

interface ExpandableTransactionDetailsProps {
	transaction: MintTransaction;
}

export function ExpandableTransactionDetails({ transaction }: ExpandableTransactionDetailsProps) {
	const bitcoinConfig = useBitcoinConfig();

	if (!bitcoinConfig?.confirmationDepth || !bitcoinConfig?.blockTimeSec) {
		return (
			<div className="bg-base-100 border-base-300 border-t p-6">
				<div className="text-base-content/60 text-center">
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
			transaction.status !== MintTxStatus.Confirming &&
			transaction.status !== MintTxStatus.Broadcasting
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

	const isBroadcasted = transaction.status !== MintTxStatus.Broadcasting;
	const isConfirmed = transaction.numberOfConfirmation >= confirmationDepth;
	const isMinted = transaction.status === MintTxStatus.Minted;
	const isFailed =
		transaction.status === MintTxStatus.MintFailed || transaction.status === MintTxStatus.Reorg;
	const showTimeRemaining =
		!isConfirmed &&
		(transaction.status === MintTxStatus.Confirming ||
			transaction.status === MintTxStatus.Broadcasting) &&
		estimatedTimeRemaining();

	return (
		<div className="bg-base-100 border-base-300 border-t p-6">
			<div className="space-y-4">
				<div className="text-base-content/70 text-sm">
					<span className="font-semibold">Operation start:</span> {operationDate.toLocaleString()}
				</div>

				<div className="divider my-2"></div>

				<div className="flex items-center gap-2 text-sm">
					{isFailed && transaction.numberOfConfirmation === 0 ? (
						<XCircle size={16} className="text-error shrink-0" />
					) : isBroadcasted ? (
						<CheckCircle size={16} className="text-success shrink-0" />
					) : (
						<AnimatedHourglass size="md" />
					)}
					<span>
						{isFailed && transaction.numberOfConfirmation === 0
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
					{isFailed && transaction.numberOfConfirmation === 0 ? null : isConfirmed ? (
						<CheckCircle size={16} className="text-success shrink-0" />
					) : transaction.numberOfConfirmation > 0 ? (
						<AnimatedHourglass size="md" />
					) : null}
					<span>
						Bitcoin confirmations:{" "}
						{isFailed && transaction.numberOfConfirmation === 0
							? 0
							: Math.min(transaction.numberOfConfirmation, confirmationDepth)}
						/{confirmationDepth}
					</span>
					{showTimeRemaining && (
						<span className="text-base-content/60">
							[{formatTimeRemaining(estimatedTimeRemaining())}]
						</span>
					)}
					<ConfirmationsTooltip blockTime={blockTime} />
				</div>

				<div className="flex items-center gap-2 text-sm">
					{isMinted ? (
						<CheckCircle size={16} className="text-success shrink-0" />
					) : isFailed ? (
						<XCircle size={16} className="text-error shrink-0" />
					) : isConfirmed ? (
						<AnimatedHourglass size="md" />
					) : null}
					<span>{isMinted ? "nBTC minted" : isConfirmed ? "nBTC minting" : "nBTC minting"}</span>
				</div>

				<div className="divider my-2"></div>

				<div className="text-base-content/70 text-sm">
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

function ConfirmationsTooltip({ blockTime }: { blockTime: number }) {
	return (
		<Tooltip
			tooltip={`Bitcoin requires confirmations to ensure that a transaction is final and irreversible, preventing double-spending. Confirmation is a Bitcoin Block minted after that transaction. 1 bitcoin block takes about ${blockTime / 60} minutes.`}
		>
			<Info size="1em" className="text-primary-foreground hover:text-primary ml-1 transition-colors" />
		</Tooltip>
	);
}
