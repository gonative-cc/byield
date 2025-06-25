import { Card, CardContent } from "../ui/card";
import { Table } from "../ui/table";
import { CellProps, Column } from "react-table";
import { SUIIcon } from "../icons";
import { trimAddress } from "../Wallet/walletHelper";

interface Bid {
	rank: number;
	bidder: string;
	time: number;
	amount: string;
}

export const columns: Column<Bid>[] = [
	{
		Header: "Rank",
		accessor: "rank",
		Cell: ({ value }: CellProps<Bid>) => <div className="flex items-center gap-2">#{value}</div>,
	},
	{
		Header: "Bidder",
		accessor: "bidder",
		Cell: ({ row }: CellProps<Bid>) => (
			<div className="flex space-x-2">
				<span>{trimAddress(row.original.bidder)}</span>
			</div>
		),
	},
	{
		Header: "Bid Time",
		accessor: "time",
		Cell: ({ row }: CellProps<Bid>) => (
			<div className="flex space-x-2">
				<span>{row.original.time} hr ago</span>
			</div>
		),
	},
	{
		Header: "Bid Amount",
		accessor: "amount",
		Cell: ({ row }: CellProps<Bid>) => (
			<div className="flex space-x-2">
				<SUIIcon prefix="" className="h-5 w-5" />
				<span>{row.original.amount} SUI</span>
			</div>
		),
	},
];

const mockLeaderBoard: Bid[] = [
	{
		rank: 1,
		bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		time: 12,
		amount: "20",
	},
	{
		rank: 1,
		bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		time: 12,
		amount: "20",
	},
	{
		rank: 1,
		bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		time: 12,
		amount: "20",
	},
	{
		rank: 1,
		bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		time: 12,
		amount: "20",
	},
	{
		rank: 1,
		bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		time: 12,
		amount: "20",
	},
	{
		rank: 1,
		bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		time: 12,
		amount: "20",
	},
];

export function AuctionTable() {
	return (
		<Card className="w-full h-fit">
			<CardContent className="p-5 rounded-lg text-white flex flex-col gap-2 bg-azure-20">
				<span className="text-xl text-primary">Leaderboard</span>
				<Table columns={columns} data={mockLeaderBoard} />
			</CardContent>
		</Card>
	);
}
