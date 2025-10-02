import { Timer, CheckCircle2, Info } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { gradientCardClasses } from "~/util/tailwind";

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
		<div className={gradientCardClasses()}>
			<div className="card-body">
				<div className="card-title flex items-center gap-2">
					<Info size={20} className="text-primary" />
					<span>Transaction Timeline</span>
				</div>
				<p className="text-sm opacity-70">
					Your Bitcoin transactions need time to be securely confirmed
				</p>

				<div className="stats stats-horizontal bg-transparent shadow-none">
					<div className="stat">
						<div className="stat-figure text-orange-500">
							<Timer size={18} />
						</div>
						<div className="stat-title text-xs">Block Time</div>
						<div className="stat-value text-lg">{blockTime / 60} min</div>
						<div className="stat-desc text-xs">Time between blocks</div>
					</div>

					<div className="stat">
						<div className="stat-figure text-success">
							<CheckCircle2 size={18} />
						</div>
						<div className="stat-title text-xs">Confirmations</div>
						<div className="stat-value text-lg">{confirmationDepth}</div>
						<div className="stat-desc text-xs">Required for security</div>
					</div>
				</div>

				<div className="alert alert-info bg-primary border-primary">
					<span className="text-white">
						Expected confirmation time: <strong>~{estimatedTime} minutes</strong>
					</span>
				</div>
			</div>
		</div>
	);
}
