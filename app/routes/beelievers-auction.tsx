import { BeelieversAuction } from "~/components/BeelieversAuction/BeelieversAuction";
import { useLoaderData } from "@remix-run/react";
import { getLeaderBoardData } from "~/BeelieversAuction/leaderboard.server";

export async function loader() {
	return await getLeaderBoardData();
}

export default function BeelieversAuctionPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="flex justify-center">
			<BeelieversAuction data={data} />
		</div>
	);
}
