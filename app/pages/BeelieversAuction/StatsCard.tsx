import type { ReactNode } from "react";
import { Card, CardContent } from "~/components/ui/card";

interface StatsCardProps {
	title: string | ReactNode;
	children: string | ReactNode;
}

export function StatsCard({ title, children }: StatsCardProps) {
	return (
		<Card className={`flex-1 group hover:scale-105`}>
			<CardContent className="p-4 sm:p-6 text-center bg-gradient-to-br from-azure-15 to-azure-25 border border-primary/20 hover:border-primary/40 transition-colors">
				<div className="text-2xl font-bold text-primary group-hover:text-orange-400 transition-colors duration-300 mb-2">
					{title}
				</div>
				<div className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
					{children}
				</div>
			</CardContent>
		</Card>
	);
}
