import { Card, CardContent } from "../ui/card";
import { Table } from "../ui/table";
import { CellProps, Column } from "react-table";
import { SUIIcon } from "../icons";
import { trimAddress } from "../Wallet/walletHelper";

export interface Bid {
	rank: number;
	bidder: string;
	time: number;
	amount: string;
}

const columns: Column<Bid>[] = [
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

interface AuctionTableProps {
	data: Bid[];
}

export function AuctionTable({ data }: AuctionTableProps) {
	return (
		<Card className="w-full h-fit">
			<CardContent className="p-5 rounded-lg text-white flex flex-col gap-2 bg-azure-20">
				<span className="text-xl text-primary">Leaderboard</span>
				<Table columns={columns} data={data} />
			</CardContent>
		</Card>
	);
}
