import { Tooltip } from "~/components/ui/tooltip";
import { Info } from "lucide-react";

export function TableTooltip({ tooltip, label }: { tooltip: string; label: string }) {
	return (
		<Tooltip tooltip={tooltip}>
			<div className="flex items-center gap-2">
				{label}
				<Info size="16" className="text-primary-foreground hover:text-primary transition-colors" />
			</div>
		</Tooltip>
	);
}
