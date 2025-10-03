export interface TweetOptions {
	theme?: 'light' | 'dark';
	conversation?: 'none';
	align?: 'left' | 'right' | 'center';
	cards?: 'hidden' | 'visible';
	dnt?: boolean;
	lang?: string;
}

declare global {
	interface Window {
		twttr?: {
			widgets: {
				load: (element?: HTMLElement) => void;
				createTweet: (
					tweetId: string,
					element: HTMLElement,
					options?: TweetOptions,
				) => Promise<HTMLElement>;
				// Add other Twitter widget methods you might use
			};
		};
	}
}

// The `export {}` makes the file a module, which can be necessary
// for `declare global` to work in some setups.
export {};
