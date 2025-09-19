import { cn } from "~/util/tailwind";

interface AnimatedHourglassProps {
	className?: string;
	size?: number;
}

export function AnimatedHourglass({ className, size = 16 }: AnimatedHourglassProps) {
	return (
		<div
			className={cn("inline-flex items-center justify-center", className)}
			style={{ width: size, height: size }}
		>
			<div className="relative">
				<div className="animate-spin duration-1000 ease-in-out">⌛</div>
			</div>
		</div>
	);
}
