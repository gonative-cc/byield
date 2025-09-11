interface AnimatedHourglassProps {
	className?: string;
}

export function AnimatedHourglass({ className = "" }: AnimatedHourglassProps) {
	return (
		<div className={`inline-flex items-center justify-center ${className}`}>
			<span
				className="text-lg animate-spin"
				style={{
					animation: "spin 2s linear infinite",
					display: "inline-block",
				}}
			>
				⌛
			</span>
		</div>
	);
}
