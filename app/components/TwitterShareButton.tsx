import { Button } from "~/components/ui/button";
import footerConfig from "~/config/footer.json";

interface TwitterShareButtonProps {
	shareContent: string;
}

export function TwitterShareButton({ shareContent }: TwitterShareButtonProps) {
	const twitterIcon = footerConfig.socials.find((social) => social.id === "x")?.src;
	const text = encodeURIComponent(shareContent);

	return (
		<a href={`https://twitter.com/intent/tweet?text=${text}`} target="_blank" rel="noreferrer">
			<Button variant="outline" size="sm">
				<img src={twitterIcon} alt="X" width={24} height={24} />
				Share on X
			</Button>
		</a>
	);
}
