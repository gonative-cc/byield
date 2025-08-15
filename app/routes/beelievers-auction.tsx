import { BeelieversAuction } from "~/pages/BeelieversAuction/BeelieversAuction";
import { useLoaderData, useFetcher } from "react-router";
import { useContext, useEffect, useRef } from "react";
import { getLeaderBoardData } from "~/server/BeelieversAuction/leaderboard.server";
import { checkEligibility } from "~/pages/BeelieversAuction/whitelist.server";
import { WalletContext } from "~/providers/ByieldWalletProvider";

export async function loader() {
	return await getLeaderBoardData();
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
	const leaderBoardData = useLoaderData<typeof loader>();
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
