import { Button } from "~/components/ui/button";
import footerConfig from "~/config/footer.json";
import { cn } from "~/util/tailwind";

interface TwitterShareButtonProps {
	shareContent: string;
	className?: string;
}

export function TwitterShareButton({ shareContent, className }: TwitterShareButtonProps) {
	const twitterIcon = footerConfig.socials.find((social) => social.id === "x")?.src;
	const text = encodeURIComponent(shareContent);

	return (
		<a href={`https://twitter.com/intent/tweet?text=${text}`} target="_blank" rel="noreferrer">
			<Button variant="outline" size="sm" className={cn("flex items-center gap-2", className)}>
				<img src={twitterIcon} alt="X" width={24} height={24} />
				Share on X
			</Button>
		</a>
	);
}
