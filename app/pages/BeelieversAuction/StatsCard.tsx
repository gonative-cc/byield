import type { ReactNode } from "react";
import { primaryHeadingClasses, GRADIENTS } from "~/util/tailwind";

interface StatsCardProps {
	title: string | ReactNode;
	children: string | ReactNode;
}

export function StatsCard({ title, children }: StatsCardProps) {
	return (
		<div className={`card group flex-1 hover:scale-105`}>
			<div
				className={`card-body ${GRADIENTS.azureCard} border p-4 text-center transition-colors sm:p-6`}
			>
				<div
					className={`${primaryHeadingClasses()} group-hover:text-primary mb-2 transition-colors duration-300`}
				>
					{title}
				</div>
				<div className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
					{children}
				</div>
			</div>
		</div>
	);
}
