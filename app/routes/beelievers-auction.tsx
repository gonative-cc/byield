import { BeelieversAuction } from "~/pages/BeelieversAuction/BeelieversAuction";
import { useLoaderData } from "react-router";
import Controller from "~/server/BeelieversAuction/controller.server";
import type { LoaderDataResp } from "~/server/BeelieversAuction/types";
import type { Route } from "./+types/beelievers-auction";

// if we need to load something directly from the client (browser):
// https://reactrouter.com/start/framework/data-loading#using-both-loaders
export async function loader({ params, context }: Route.LoaderArgs): Promise<LoaderDataResp> {
	const ctrl = new Controller(context.cloudflare.env.BeelieversNFT);
	// TODO: add user (suiAddress) as an argument to the loader
	console.log(">>>>> LOADER handler - let's see how we can send params", params);
	return await ctrl.loadPageData();
}

// This is a server action to post data to server (data mutations)
export async function action({ request, context }: Route.ActionArgs) {
	/* eslint-disable @typescript-eslint/no-explicit-any */
	const reqData = (await request.json()) as any;
	console.log(">>>>> ACTION handler", request, reqData);
	const ctrl = new Controller(context.cloudflare.env.BeelieversNFT);
	// TODO: Ravindra: now inspect request , and based on request call specific controller
	// const formData = await request.formData();
	// if request.params.method == queryUser ...
	//    ctrl.getUserData(request.params.)
	return ctrl.getUserData(reqData.params[0] as string);
}

export default function BeelieversAuctionPage() {
	const pageData = useLoaderData<typeof loader>();
	if (!pageData || pageData?.error) {
		throw Error("Couldn't load the auction data");
	}

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
