import React from "react";

export function Tooltip({
	tooltip,
	children,
	className,
}: {
	tooltip: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`tooltip tooltip-bottom ${className}`} data-tip={tooltip}>
			{children}
		</div>
	);
}
