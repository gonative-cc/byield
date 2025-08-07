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
			isEligible: false,
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

	// Reset state when wallet is disconnected
	useEffect(() => {
		if (!suiAddr && lastCheckedAddress.current) {
			// Wallet disconnected - reset state
			lastCheckedAddress.current = null;
		}
	}, [suiAddr]);

	// Reset eligibility data when wallet is disconnected
	const eligibilityData = suiAddr ? fetcher.data : undefined;

	// Function to manually check eligibility
	const checkEligibility = () => {
		if (suiAddr && fetcher.state === "idle") {
			lastCheckedAddress.current = suiAddr;
			const formData = new FormData();
			formData.append("suiAddress", suiAddr);
			fetcher.submit(formData, { method: "POST" });
		}
	};

	return (
		<div className="flex justify-center p-4">
			<BeelieversAuction
				leaderBoardData={leaderBoardData}
				eligibilityData={eligibilityData}
				isCheckingEligibility={fetcher.state === "submitting"}
				onCheckEligibility={checkEligibility}
			/>
		</div>
	);
}
