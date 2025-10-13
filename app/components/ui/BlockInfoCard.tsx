import { Timer, CheckCircle2, Clock } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";

export function BlockInfoCard() {
	const bitcoinConfig = useBitcoinConfig();

	const blockTime = bitcoinConfig?.blockTimeSec;
	const confirmationDepth = bitcoinConfig?.confirmationDepth;

	if (!blockTime || !confirmationDepth) {
		return toast({
			title: "Data not available",
			description: "Data is not available at the moment",
			variant: "info",
		});
	}

	const estimatedTime = Math.ceil((blockTime * confirmationDepth) / 60);

	return (
		<div className="card">
			<div className="card-body p-4">
				<h3 className="card-title text-base">Transaction Info</h3>

				<div className="space-y-3 text-sm">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Timer size={16} className="text-primary" />
							Block Time
						</div>
						<span className="badge badge-accent">{blockTime / 60} min</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CheckCircle2 size={16} className="text-primary" />
							Confirmations
						</div>
						<span className="badge badge-accent">{confirmationDepth}</span>
					</div>

					<div className="divider my-0"></div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock size={16} className="text-primary" />
							Est. Time
						</div>
						<span className="badge badge-accent">~{estimatedTime} min</span>
					</div>
				</div>
			</div>
		</div>
	);
}
