import { BeelieversAuction } from "~/components/BeelieversAuction/BeelieversAuction";
import { useLoaderData } from "@remix-run/react";
import { getLeaderBoardData } from "~/.server/leaderboard";

export async function loader() {
	const data = await getLeaderBoardData();
	return data;
}

export default function BeelieversAuctionPage() {
	const data = useLoaderData<typeof loader>();
	return (
		<div className="flex justify-center">
			<BeelieversAuction data={data} />
		</div>
	);
}
