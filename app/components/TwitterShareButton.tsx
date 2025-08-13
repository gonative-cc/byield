import { Button } from "~/components/ui/button";
import footerConfig from "~/config/footer.json";

interface TwitterShareButtonProps {
	shareContent: string;
}

export function TwitterShareButton({ shareContent }: TwitterShareButtonProps) {
	const twitterIcon = footerConfig.socials.find((social) => social.id === "x")?.src;

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() => {
				const text = encodeURIComponent(shareContent);
				window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
			}}
			className="flex items-center gap-2"
		>
			<img src={twitterIcon} alt="X" width={24} height={24} />
			Share on X
		</Button>
	);
}
