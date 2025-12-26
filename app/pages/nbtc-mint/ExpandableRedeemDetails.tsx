import { Info, CheckCircle } from "lucide-react";
import { type RedeemRequestResp, RedeemRequestStatus } from "@gonative-cc/sui-indexer/models";
import { AnimatedHourglass } from "~/components/ui/AnimatedHourglass";
import { Tooltip } from "~/components/ui/tooltip";
import { formatNBTC } from "~/lib/denoms";

interface ExpandableRedeemDetailsProps {
	transaction: RedeemRequestResp;
}

export function ExpandableRedeemDetails({ transaction }: ExpandableRedeemDetailsProps) {
	const operationDate = new Date(transaction.created_at);

	const isPending = transaction.status === RedeemRequestStatus.Pending;
	const isProposed = transaction.status === RedeemRequestStatus.Proposed;
	const isSigned = transaction.status === RedeemRequestStatus.Signed;
	const isBroadcasted = transaction.status === RedeemRequestStatus.Broadcasted;
	const isSolved = transaction.status === RedeemRequestStatus.Solved;

	const isUTXOSelectionProposed = isProposed || isSigned || isBroadcasted || isSolved;
	const isTxnSigned = isSigned || isBroadcasted || isSolved;
	const isBitCoinTxBroadcasted = isBroadcasted || isSolved;

	return (
		<div className="bg-base-100 border-base-300 p-6">
			<div className="space-y-4">
				<div className="text-base-content/70 text-sm">
					<span className="font-semibold">Redeem request created:</span>{" "}
					{operationDate.toLocaleString()}
				</div>

				<div className="divider my-2"></div>

				<div className="flex items-center gap-2 text-sm">
					{isPending ? (
						<AnimatedHourglass size="md" />
					) : (
						<CheckCircle size={16} className="text-success shrink-0" />
					)}
					<span>{isPending ? "Redeem request pending" : "Redeem request created"}</span>
				</div>

				<div className="flex items-center gap-2 text-sm">
					{isUTXOSelectionProposed ? (
						<CheckCircle size={16} className="text-success shrink-0" />
					) : isPending ? (
						<AnimatedHourglass size="md" />
					) : null}
					<span>
						{isUTXOSelectionProposed ? "UTXO selection proposed" : "Awaiting UTXO selection"}
					</span>
				</div>

				<div className="flex items-center gap-2 text-sm">
					{isTxnSigned ? (
						<CheckCircle size={16} className="text-success shrink-0" />
					) : isProposed ? (
						<AnimatedHourglass size="md" />
					) : null}
					<span>{isTxnSigned ? "Transaction signed" : "Awaiting transaction signing"}</span>
				</div>

				<div className="flex items-center gap-2 text-sm">
					{isBitCoinTxBroadcasted ? (
						<CheckCircle size={16} className="text-success shrink-0" />
					) : isSigned ? (
						<AnimatedHourglass size="md" />
					) : null}
					<span>
						{isBitCoinTxBroadcasted
							? "Bitcoin transaction broadcasted"
							: "Awaiting Bitcoin broadcast"}
					</span>
				</div>

				<div className="flex items-center gap-2 text-sm">
					{isSolved ? (
						<CheckCircle size={16} className="text-success shrink-0" />
					) : isBroadcasted ? (
						<AnimatedHourglass size="md" />
					) : null}
					<span>{isSolved ? "BTC sent to recipient" : "Awaiting Bitcoin confirmation"}</span>
					<RedeemTooltip />
				</div>

				<div className="divider my-2"></div>

				<div className="text-base-content/70 text-sm">
					<span className="font-semibold">Amount:</span>{" "}
					{formatNBTC(BigInt(transaction.amount_sats || 0))} nBTC
				</div>

				<div className="text-base-content/70 text-sm">
					<span className="font-semibold">Recipient:</span>
					<span className="ml-2 font-mono">{transaction.recipient_script}</span>
				</div>
			</div>
		</div>
	);
}

function RedeemTooltip() {
	return (
		<Tooltip tooltip="The redeem process involves multiple steps: creating the request, selecting UTXOs, signing the transaction, broadcasting to Bitcoin network, and waiting for confirmation.">
			<Info size="1em" className="text-primary-foreground hover:text-primary ml-1 transition-colors" />
		</Tooltip>
	);
}
