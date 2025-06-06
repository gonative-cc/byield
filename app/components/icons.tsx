import { twMerge } from "tailwind-merge";

interface IconProps {
	prefix?: string;
	src?: string;
	alt?: string;
	containerClassName?: string;
	className?: string;
}

function Icon({ src, prefix, alt, className, containerClassName }: IconProps) {
	return (
		<div className={twMerge("flex gap-2 items-center", containerClassName)}>
			{prefix}
			<img src={src} alt={alt} loading="lazy" className={twMerge("w-7 h-7", className)} />
		</div>
	);
}

export function SUIIcon(props: IconProps) {
	return (
		<Icon
			prefix={"SUI"}
			src="https://cdn.prod.website-files.com/6425f546844727ce5fb9e5ab/65690e5e73e9e2a416e3502f_sui-mark.svg"
			alt="SUI"
			{...props}
		/>
	);
}

export function BitCoinIcon() {
	return <Icon src="/assets/coins/bitcoin.svg" alt="bitcoin" />;
}

export function NBTCIcon(props: IconProps) {
	return <Icon prefix={"nBTC"} src="/assets/coins/nbtc.svg" alt="nBTC" {...props} />;
}
