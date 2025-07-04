import { BeelieversAuction } from "~/pages/BeelieversAuction/BeelieversAuction";
import { useActionData, useLoaderData } from "react-router";
import { getLeaderBoardData } from "~/server/BeelieversAuction/leaderboard.server";
import { checkEligibility } from "~/pages/BeelieversAuction/whitelist.server";

export async function loader() {
	return await getLeaderBoardData();
}

export async function action() {
	// Using an empty string as a placeholder for eligibility checks.
	const isEligible = await checkEligibility("");
	return {
		isEligible,
		isError: false,
	};
}

export default function BeelieversAuctionPage() {
	const leaderBoardData = useLoaderData<typeof loader>();
	const eligibilityData = useActionData<typeof action>();

	return (
		<div className="flex justify-center">
			<BeelieversAuction leaderBoardData={leaderBoardData} eligibilityData={eligibilityData} />
		</div>
	);
}
