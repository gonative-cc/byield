import { cn } from "~/tailwind";

interface AnimatedHourglassProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function AnimatedHourglass({ className, size = "md" }: AnimatedHourglassProps) {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-4 h-4",
		lg: "w-6 h-6",
	};

	return (
		<div
			className={cn(
				"inline-flex animate-spin items-center justify-center duration-1000 ease-in-out",
				sizeClasses[size],
				className,
			)}
		>
			⌛
		</div>
	);
}
