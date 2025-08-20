import { BeelieversAuction } from "~/pages/BeelieversAuction/BeelieversAuction";
import { useLoaderData } from "react-router";
import Controller from "~/server/BeelieversAuction/controller.server";
import type { LoaderDataResp } from "~/server/BeelieversAuction/types";
import type { Route } from "./+types/beelievers-auction";
import { useState, useEffect } from "react";
import { AuctionLogin } from "~/pages/BeelieversAuction/AuctionLogin";

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
	const pageData = useLoaderData<typeof loader>();
	const [authToken, setAuthToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("auctionAuthToken");
		if (token) {
			setAuthToken(token);
		}
		setIsLoading(false);
	}, []);

	if (pageData?.error) {
		throw Error("Couldn't load the auction data");
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-br from-background via-azure-20 to-azure-25 p-4 sm:p-6 lg:p-8 min-h-screen">
			<div className="flex justify-center">
				<div className="w-full max-w-7xl animate-in fade-in-0 duration-700">
					{authToken ? (
						<BeelieversAuction
							auctionDetails={pageData.details}
							leaderboard={pageData.leaderboard}
						/>
					) : (
						// Remove the onLoginSuccess prop
						<AuctionLogin />
					)}
				</div>
			</div>
		</div>
	);
}
