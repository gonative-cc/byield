import type { CellProps, Column } from "react-table";
import { SUIIcon } from "~/components/icons";
import { Card, CardContent } from "~/components/ui/card";
import { Table } from "~/components/ui/table";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useContext } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { getBadgesForBidder } from "~/lib/badgeSystem";
import { Badge } from "~/components/Badge";
import type { Bidder } from "./types";

const MAX_LEADERBOARD_ROWS = 21;

interface AuctionTableProps {
	data: Bidder[];
}

const createColumns = (): Column<Bidder>[] => [
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
			const badgeNames = row.original.badges || [];
			const badges = badgeNames.map(getBadgesForBidder).filter(Boolean);

			return (
				<div className="flex space-x-1 justify-center">
					{badges.length > 0 ? (
						badges.map((badge, index) => (
							<Badge key={index} src={badge!.src} title={badge!.name} />
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

export function AuctionTable({ data }: AuctionTableProps) {
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
	const columns = createColumns();

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
