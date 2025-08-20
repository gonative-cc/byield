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
	const ctrl = new Controller(context.cloudflare.env.BeelieversNFT);
	const url = new URL(request.url);
	const suiAddress = url.searchParams.get("suiAddress") ?? undefined;
	console.log(">>>>> LOADER handler - params:", params, "suiAddress:", suiAddress);
	return await ctrl.loadPageData(suiAddress);
}

// This is a server action to post data to server (data mutations)
export async function action({ request, context }: Route.ActionArgs) {
	const ctrl = new Controller(context.cloudflare.env.BeelieversNFT);
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
