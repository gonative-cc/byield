import type { CellProps, Column } from "react-table";
import { SUIIcon } from "~/components/icons";
import { Card, CardContent } from "~/components/ui/card";
import { Table } from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useState } from "react";

export interface Bid {
	rank: number;
	bidder: string;
	amount: string;
	note?: string;
}

function NoteInput() {
	const [note, setNote] = useState("");

	return (
		<Input
			type="text"
			placeholder="Add note..."
			value={note}
			onChange={(e) => setNote(e.target.value)}
			maxLength={30}
			containerClassName="max-w-1/2"
		/>
	);
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
		Header: "Note",
		accessor: "note",
		Cell: () => <NoteInput />,
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
