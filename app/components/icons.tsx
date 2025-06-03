import { twMerge } from "tailwind-merge";

interface IconProps {
	prefix?: string;
	src: string;
	alt: string;
	className?: string;
}

function Icon({ src, prefix, alt, className }: IconProps) {
	return (
		<div className="flex gap-2 items-center">
			{prefix}
			<img src={src} alt={alt} loading="lazy" className={twMerge("w-7 h-7", className)} />
		</div>
	);
}

export function SUIIcon() {
	return (
		<Icon
			prefix={"SUI"}
			src="https://cdn.prod.website-files.com/6425f546844727ce5fb9e5ab/65690e5e73e9e2a416e3502f_sui-mark.svg"
			alt="SUI"
			className="mr-2"
		/>
	);
}

export function NBTCIcon() {
	return <Icon prefix={"nBTC"} src="/assets/ui-icons/nbtc.svg" alt="nBTC" className="mr-4" />;
}

export function BitCoinIcon() {
	return <Icon src="/assets/ui-icons/bitcoin.svg" alt="bitcoin" />;
}
