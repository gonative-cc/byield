interface BadgeProps {
	src: string;
	title?: string;
}

export function Badge({ src, title }: BadgeProps) {
	return (
		<div className="relative group">
			<img
				src={src}
				alt={title}
				className={`bg-gray-700 w-8 h-8 hover:scale-110 transition-transform cursor-help`}
			/>
		</div>
	);
}
