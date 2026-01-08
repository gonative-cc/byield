import { Info, CheckCircle } from "lucide-react";
import { type RedeemRequestResp, RedeemRequestStatus } from "@gonative-cc/sui-indexer/models";
import { AnimatedHourglass } from "~/components/ui/AnimatedHourglass";
import { Tooltip } from "~/components/ui/tooltip";
import { formatNBTC } from "~/lib/denoms";

interface ExpandableRedeemDetailsProps {
	transaction: RedeemRequestResp;
}

const steps = [
	{ status: RedeemRequestStatus.Pending, activeMsg: "Redeem request pending" },
	{ status: RedeemRequestStatus.Proposed, activeMsg: "Transaction proposed" },
	{ status: RedeemRequestStatus.Solved, activeMsg: "Transaction solved" },
	{ status: RedeemRequestStatus.Signed, activeMsg: "Transaction signed" },
	{ status: RedeemRequestStatus.Broadcasted, activeMsg: "Bitcoin transaction broadcasted" },
];

const renderStep = (step: (typeof steps)[0], index: number, currentStepIndex: number) => {
	const isCompleted = index < currentStepIndex;
	const isCurrent = index === currentStepIndex;
	const isLastStep = index === steps.length - 1;
	const shouldShow = isCompleted || isCurrent;

	if (!shouldShow) return null;

	return (
		<div key={step.status} className="flex items-center gap-2 text-sm">
			{isCurrent && !isLastStep ? (
				<AnimatedHourglass size="md" />
			) : (
				<CheckCircle size={16} className="text-success shrink-0" />
			)}
			<span className={!isLastStep && isCurrent ? "text-muted-foreground" : ""}>{step.activeMsg}</span>
		</div>
	);
};

export function ExpandableRedeemDetails({ transaction }: ExpandableRedeemDetailsProps) {
	const operationDate = new Date(transaction.created_at);
	const currentStepIndex = steps.findIndex((step) => step.status === transaction.status);

	return (
		<div className="bg-base-100 border-base-300 p-6">
			<div className="space-y-4">
				<div className="text-base-content/70 text-sm">
					<span className="font-semibold">Redeem request created:</span>{" "}
					{operationDate.toLocaleString()}
				</div>
				<div className="divider my-2"></div>
				<div className="space-y-3">
					{steps.map((step, index) => renderStep(step, index, currentStepIndex))}
				</div>
				<div className="divider my-2"></div>
				<div className="text-base-content/70 text-sm">
					<span className="font-semibold">Amount:</span>{" "}
					{formatNBTC(BigInt(transaction.amount || 0))} nBTC
				</div>
				<div className="text-base-content/70 text-sm">
					<span className="font-semibold">Recipient:</span>
					<span className="ml-2 font-mono">{transaction.recipient_script}</span>
					<RedeemTooltip />
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
