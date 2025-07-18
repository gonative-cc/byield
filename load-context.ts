import { type PlatformProxy } from "wrangler";

type GetLoadContextArgs = {
	request: Request;
	context: {
		cloudflare: Omit<PlatformProxy<Env>, "dispose" | "caches" | "cf"> & {
			caches: PlatformProxy<Env>["caches"] | CacheStorage;
			cf: Request["cf"];
		};
	};
};

declare module "@react-router/cloudflare" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface AppLoadContext extends ReturnType<typeof getLoadContext> {
		// This will merge the result of `getLoadContext` into the `AppLoadContext`
	}
}

export function getLoadContext({ context }: GetLoadContextArgs) {
	return context;
}
