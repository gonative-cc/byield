import { twMerge } from "tailwind-merge";

interface IconProps {
	prefix: string;
	src: string;
	alt: string;
	className?: string;
}

export function Icon({ src, prefix, alt, className }: IconProps) {
	return (
		<div className="flex gap-2 items-center mr-2">
			{prefix}
			<img src={src} alt={alt} loading="lazy" className={twMerge("w-7 h-7 mr-2", className)} />
		</div>
	);
}
