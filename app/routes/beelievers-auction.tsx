import { BeelieversAuction } from "~/pages/BeelieversAuction/BeelieversAuction";
import { useLoaderData, useFetcher } from "react-router";
import { useContext, useEffect, useRef } from "react";
import Controller from "~/server/BeelieversAuction/controller.server";
import type { LoaderDataResp } from "~/server/BeelieversAuction/types";
import { checkEligibility } from "~/pages/BeelieversAuction/whitelist.server";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import type { Route } from "./+types/beelievers-auction";

// if we need to load something directly from the client (browser):
// https://reactrouter.com/start/framework/data-loading#using-both-loaders
export async function loader({ context, params }: Route.LoaderArgs): Promise<LoaderDataResp> {
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

// TODO: inspect why this page loads many times
export default function BeelieversAuctionPage() {
	// TODO: handle page.user
	const pageData = useLoaderData<typeof loader>();
	// TODO: remove and use data above
	const leaderBoardData = {
		leaders: [],
		unique_bidders: 600,
		total_bids: 1250,
		highest_bid: 100,
		entry_bid: 2,
		auction_start_ms: Date.now() + 24 * 60 * 60 * 1000,
		auction_end_ms: Date.now() + 48 * 60 * 60 * 1000,
	};
	const fetcher = useFetcher<typeof action>();
	const { suiAddr } = useContext(WalletContext);
	const lastCheckedAddress = useRef<string | null>(null);

	// Check eligibility when wallet connects or address changes, reset when disconnected
	useEffect(() => {
		if (suiAddr && suiAddr !== lastCheckedAddress.current && fetcher.state === "idle") {
			// Wallet connected or address changed - check eligibility
			lastCheckedAddress.current = suiAddr;
			const formData = new FormData();
			formData.append("suiAddress", suiAddr);
			fetcher.submit(formData, { method: "POST" });
		} else if (!suiAddr && lastCheckedAddress.current) {
			// Wallet disconnected - reset state
			lastCheckedAddress.current = null;
		}
	}, [suiAddr, fetcher.state, fetcher]);

	// Reset eligibility data when wallet is disconnected
	const eligibilityData = suiAddr ? fetcher.data : undefined;

	return (
		<div className="bg-gradient-to-br from-background via-azure-20 to-azure-25 p-4 sm:p-6 lg:p-8">
			<div className="flex justify-center">
				<div className="w-full max-w-7xl animate-in fade-in-0 duration-700">
					<BeelieversAuction leaderBoardData={leaderBoardData} eligibilityData={eligibilityData} />
				</div>
			</div>
		</div>
	);
}
