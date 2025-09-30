import { cn } from "~/util/tailwind";

interface BeelieversBadgeProps {
	hasMinted: boolean;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function BeelieversBadge({ hasMinted, className, size = "md" }: BeelieversBadgeProps) {
	if (!hasMinted) {
		return null;
	}

	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-5 h-5",
		lg: "w-6 h-6",
	};

	return (
		<div className={cn("flex items-center", className)}>
			<img
				src="/assets/ui-icons/beelievers-badge1.svg"
				alt="Beelievers NFT Badge"
				className={cn(
					"transition-all duration-300 hover:scale-110",
					"filter drop-shadow-sm",
					sizeClasses[size],
				)}
				title="Beelievers NFT Holder"
			/>
		</div>
	);
}

/**
 * Alternative badge component with glow effect for special emphasis
 */
export function BeelieversBadgeGlow({ hasMinted, className, size = "md" }: BeelieversBadgeProps) {
	if (!hasMinted) {
		return null;
	}

	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-5 h-5",
		lg: "w-6 h-6",
	};

	return (
		<div className={cn("flex items-center relative", className)}>
			<div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-sm animate-pulse" />
			<img
				src="/assets/ui-icons/beelievers-badge1.svg"
				alt="Beelievers NFT Badge"
				className={cn(
					"relative z-10 transition-all duration-300 hover:scale-110",
					"filter drop-shadow-md",
					sizeClasses[size],
				)}
				title="Beelievers NFT Holder - You're a true Beeliever! 🐝"
			/>
		</div>
	);
}
