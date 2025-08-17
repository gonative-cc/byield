import { BeelieversAuction } from "~/pages/BeelieversAuction/BeelieversAuction";
import { useLoaderData } from "react-router";
import Controller from "~/server/BeelieversAuction/controller.server";
import type { LoaderDataResp } from "~/server/BeelieversAuction/types";
import { checkEligibility } from "~/pages/BeelieversAuction/whitelist.server";
import type { Route } from "./+types/beelievers-auction";

// if we need to load something directly from the client (browser):
// https://reactrouter.com/start/framework/data-loading#using-both-loaders
export async function loader({ context }: Route.LoaderArgs): Promise<LoaderDataResp> {
	const ctrl = new Controller(context.cloudflare.env.BeelieversNFT);
	// TODO: add user as an argument to the loader
	return await ctrl.loadPageData();
}

export async function action({ request }: { request: Request }) {
	const formData = await request.formData();
	const suiAddress = formData.get("suiAddress") as string;

	if (!suiAddress) {
		return {
			type: undefined,
			isError: true,
		};
	}

	const eligible = await checkEligibility(suiAddress);
	return {
		...eligible,
		isError: false,
	};
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
					<BeelieversAuction auctionDetails={pageData.details} leaderBoard={pageData.leaderboard} />
				</div>
			</div>
		</div>
	);
}
