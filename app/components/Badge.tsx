interface BadgeProps {
	src: string;
	title?: string;
	className?: string;
}

export function Badge({ src, title, className = "w-5 h-5" }: BadgeProps) {
	return (
		<div className="relative group">
			<img
				src={src}
				alt={title}
				className={`${className} hover:scale-110 transition-transform cursor-help`}
			/>
		</div>
	);
}
