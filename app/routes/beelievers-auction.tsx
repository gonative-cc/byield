import { useEffect } from "react";
import { useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";

import { BeelieversAuction } from "~/pages/BeelieversAuction/BeelieversAuction";
import Controller from "~/server/BeelieversAuction/controller.server";
import type { LoaderDataResp } from "~/server/BeelieversAuction/types";
import type { Route } from "./+types/beelievers-auction";
import { isProductionMode } from "~/lib/appenv";
import { toast } from "~/hooks/use-toast";
import { GRADIENTS, cn } from "~/util/tailwind";

// if we need to load something directly from the client (browser):
// https://reactrouter.com/start/framework/data-loading#using-both-loaders
export async function loader({ params, context, request }: Route.LoaderArgs): Promise<LoaderDataResp> {
	const env = context.cloudflare.env;
	const ctrl = new Controller(
		env.BeelieversNFT,
		env.BeelieversD1,
		env.TRADEPORT_API_USER,
		env.TRADEPORT_API_KEY,
	);
	const url = new URL(request.url);
	// We can try to set user address to the params
	// Probably we can use https://reactrouter.com/start/framework/route-module#unstable_clientmiddleware
	// const suiAddress = url.searchParams.get("suiAddress") ?? undefined;
	// Debug: Page Loader handler
	return await ctrl.loadPageData();
}

// This is a server action to post data to server (data mutations)
export async function action({ request, context }: Route.ActionArgs) {
	const env = context.cloudflare.env;
	const ctrl = new Controller(
		env.BeelieversNFT,
		env.BeelieversD1,
		env.TRADEPORT_API_USER,
		env.TRADEPORT_API_KEY,
	);
	return ctrl.handleJsonRPC(request);
}

export default function BeelieversAuctionPage({ loaderData }: Route.ComponentProps) {
	const { network } = useSuiClientContext();
	const { mutate: disconnect } = useDisconnectWallet();
	const isTestnet = network === "testnet";
	if (!loaderData || loaderData?.error) {
		throw Error("Couldn't load the auction data");
	}

	useEffect(() => {
		if (isProductionMode() && isTestnet) {
			disconnect();
			toast({ title: "Testnet is not supported. Switch to mainnet", variant: "warning" });
		}
	}, [disconnect, isTestnet]);

	return (
		<div className={cn(GRADIENTS.pageBg, "p-4 sm:p-6 lg:p-8")}>
			<div className="flex justify-center">
				<div className="animate-in fade-in-0 w-full max-w-7xl duration-700">
					<BeelieversAuction info={loaderData.details} leaderboard={loaderData.leaderboard} />
				</div>
			</div>
		</div>
	);
}
