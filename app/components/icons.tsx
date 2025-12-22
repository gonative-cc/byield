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
		<div className={twMerge("flex items-center gap-2", containerClassName)}>
			{prefix}
			<img src={src} alt={alt} loading="lazy" className={twMerge("h-7 w-7", className)} />
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

export function BitCoinIcon(props: IconProps) {
	return <Icon src="/assets/coins/bitcoin.svg" alt="bitcoin" {...props} />;
}

export function USDCIcon(props: IconProps) {
	return (
		<Icon
			prefix={"USDC"}
			src="https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f432058742cdf4674bd43f309e69778a26969372310135be97eb183d91c492154176d455b8/asset_icons/9d67b728b6c8f457717154b3a35f9ddc702eae7e76c4684ee39302c4d7fd0bb8.png"
			alt="USDC"
			{...props}
		/>
	);
}

export function NBTCIcon(props: IconProps) {
	return <Icon prefix={"nBTC"} src="/assets/coins/nbtc.svg" alt="nBTC" {...props} />;
}

export function NBTCRaw({ className }: { className?: string }) {
	return <img src="/assets/coins/nbtc.svg" alt="nBTC" className={className} />;
}
