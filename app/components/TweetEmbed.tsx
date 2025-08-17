import { useEffect } from "react";

interface TweetEmbedProps {
	src: string;
}

export function TweetEmbed({ src }: TweetEmbedProps) {
	useEffect(() => {
		// This function loads the twitter widgets script
		const loadTwitterScript = () => {
			// Check if the script is already loaded
			if (window?.twttr) {
				window?.twttr?.widgets.load();
				return;
			}

			const script = document.createElement("script");
			script.src = "https://platform.twitter.com/widgets.js";
			script.async = true;
			document.body.appendChild(script);

			// Clean up function to remove the script on unmount
			return () => {
				document.body.removeChild(script);
			};
		};

		loadTwitterScript();
	}, []);

	return (
		<blockquote className="twitter-tweet" data-media-max-width="560">
			<a href={`${src}?ref_src=twsrc%5Etfw`}>{""}</a>
		</blockquote>
	);
}
