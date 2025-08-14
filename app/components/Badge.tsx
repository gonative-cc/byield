interface BadgeProps {
	src: string;
	alt: string;
	title?: string;
	className?: string;
}

export function Badge({ src, alt, title, className = "w-5 h-5" }: BadgeProps) {
	return (
		<div className="relative group">
			<img
				src={src}
				alt={alt}
				className={`${className} hover:scale-110 transition-transform cursor-help`}
				title={title || alt}
			/>
			{title && (
				<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
					{title}
				</div>
			)}
		</div>
	);
}
