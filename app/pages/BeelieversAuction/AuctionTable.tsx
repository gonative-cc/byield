import type { CellProps, Column } from "react-table";
import { SUIIcon } from "~/components/icons";
import { Card, CardContent } from "~/components/ui/card";
import { Table } from "~/components/ui/table";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useContext } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { getBadgesForBidder } from "~/lib/badgeSystem";
import { Badge } from "~/components/Badge";
import type { Bidder, LeaderboardData } from "./types";

const MAX_LEADERBOARD_ROWS = 21;

// Re-export Bidder type for backward compatibility
export type { Bidder };

interface AuctionTableProps {
	data: Bidder[];
	leaderboardData?: LeaderboardData;
}

const createColumns = (
	allBidders: Bidder[],
	leaderboardData: LeaderboardData | undefined,
): Column<Bidder>[] => [
	{
		Header: "Rank",
		accessor: "rank",
		Cell: ({ value }: CellProps<Bidder>) => <div className="flex items-center gap-2">#{value}</div>,
	},
	{
		Header: "Bidder",
		accessor: "bidder",
		Cell: ({ row }: CellProps<Bidder>) => (
			<div className="flex space-x-2">
				<span>{trimAddress(row.original.bidder)}</span>
			</div>
		),
	},
	{
		Header: "Badges",
		Cell: ({ row }: CellProps<Bidder>) => {
			if (!leaderboardData) {
				return <span className="text-gray-400">-</span>;
			}

			const badges = getBadgesForBidder(row.original, allBidders, leaderboardData);
			return (
				<div className="flex space-x-1 justify-center">
					{badges.length > 0 ? (
						badges.map((badge, index) => (
							<Badge
								key={index}
								src={badge.src}
								alt={badge.name}
								title={badge.name}
								className="w-6 h-6"
							/>
						))
					) : (
						<span className="text-gray-400">-</span>
					)}
				</div>
			);
		},
	},
	{
		Header: "Bid Amount",
		accessor: "amount",
		Cell: ({ row }: CellProps<Bidder>) => (
			<div className="flex space-x-2">
				<SUIIcon prefix="" className="h-5 w-5" />
				<span>{row.original.amount} SUI</span>
			</div>
		),
	},
	{
		Header: "Note",
		accessor: "note",
		Cell: ({ row }: CellProps<Bidder>) => <span>{row.original.note || "-"}</span>,
	},
];

export function AuctionTable({ data, leaderboardData }: AuctionTableProps) {
	const { suiAddr } = useContext(WalletContext);

	const userBid = data.find((bid) => bid.bidder === suiAddr);
	const userPosition = userBid?.rank;

	const getDisplayData = (): Bidder[] => {
		const top21 = data.slice(0, MAX_LEADERBOARD_ROWS);

		if (userPosition && userPosition > MAX_LEADERBOARD_ROWS && userBid) {
			return [...top21, userBid];
		}

		return top21;
	};

	const displayData = getDisplayData();
	const columns = createColumns(data, leaderboardData);

	const getRowProps = (row: { original: Bidder }) => {
		const isUserRow = row.original.bidder === suiAddr;
		return {
			className: isUserRow ? "bg-primary/10 border-l-4 border-primary" : "",
		};
	};

	return (
		<Card className="w-full h-fit">
			<CardContent className="p-5 rounded-lg text-white flex flex-col gap-2 bg-azure-20">
				<div className="flex justify-between items-center">
					<span className="text-xl text-primary">Leaderboard</span>
				</div>
				<Table columns={columns} data={displayData} getRowProps={getRowProps} />
			</CardContent>
		</Card>
	);
}
