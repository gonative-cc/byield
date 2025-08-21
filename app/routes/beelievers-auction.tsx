import { BeelieversAuction } from "~/pages/BeelieversAuction/BeelieversAuction";
import { useLoaderData } from "react-router";
import Controller from "~/server/BeelieversAuction/controller.server";
import type { LoaderDataResp } from "~/server/BeelieversAuction/types";
import type { Route } from "./+types/beelievers-auction";
import { useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";
import { useEffect } from "react";
import { isProductionMode } from "~/lib/appenv";

// if we need to load something directly from the client (browser):
// https://reactrouter.com/start/framework/data-loading#using-both-loaders
export async function loader({ params, context, request }: Route.LoaderArgs): Promise<LoaderDataResp> {
	const env = context.cloudflare.env;
	const ctrl = new Controller(env.BeelieversNFT, env.BeelieversD1);
	const url = new URL(request.url);
	// const suiAddress = url.searchParams.get("suiAddress") ?? undefined;
	console.log(">>>>> Page Loader handler - params:", params, "url:", url.href);
	// TODO: add user param
	return await ctrl.loadPageData();
}

// This is a server action to post data to server (data mutations)
// TODO Stan: we need to pass Sui network info to Controller constructor.
// Normally, in UI we use `account = useCurrentAccount();` but the function below is in server context,
//   so we need to provide that information through the request - probably through makeReq.
//   Whenever we do fetcher.submit the function below (action) is called.
export async function action({ request, context }: Route.ActionArgs) {
	const env = context.cloudflare.env;
	const ctrl = new Controller(env.BeelieversNFT, env.BeelieversD1);
	return ctrl.handleJsonRPC(request);
}

export default function BeelieversAuctionPage() {
	const { network } = useSuiClientContext();
	const { mutate: disconnect } = useDisconnectWallet();
	const isTestnet = network === "testnet";
	// TODO: this page get reloaded when we already have account data, so let's try to pass the account
	// as an argument to the loader somehow. Could be through the URL query.
	const pageData = useLoaderData<typeof loader>();
	if (!pageData || pageData?.error) {
		throw Error("Couldn't load the auction data");
	}

	// TODO: remove this after auction. enforce network change
	useEffect(() => {
		if (isProductionMode()) {
			if (isTestnet) {
				disconnect();
			}
		}
	}, [disconnect, isTestnet]);

	return (
		<div className="bg-gradient-to-br from-background via-azure-20 to-azure-25 p-4 sm:p-6 lg:p-8">
			<div className="flex justify-center">
				<div className="w-full max-w-7xl animate-in fade-in-0 duration-700">
					<BeelieversAuction auctionDetails={pageData.details} leaderboard={pageData.leaderboard} />
				</div>
			</div>
		</div>
	);
}
