import { twMerge } from "tailwind-merge";

interface AttemptAuctionProps {
	className?: string;
}

export function AttemptAuction({ className }: AttemptAuctionProps) {
	return (
		<div className={twMerge("flex gap-2 self-end items-center", className)}>
			<img src="/assets/ui-icons/auction-hammer.svg" alt="Auction hammer" className="h-6 w-6" />
			3/10
		</div>
	);
}
