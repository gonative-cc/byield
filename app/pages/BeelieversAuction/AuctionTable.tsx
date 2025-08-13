import type { CellProps, Column } from "react-table";
import { SUIIcon } from "~/components/icons";
import { Card, CardContent } from "~/components/ui/card";
import { Table } from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useState, useContext } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";

const MAX_LEADERBOARD_ROWS = 21;

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

const createColumns = (): Column<Bid>[] => [
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
		Header: "Bid Amount",
		accessor: "amount",
		Cell: ({ row }: CellProps<Bid>) => (
			<div className="flex space-x-2">
				<SUIIcon prefix="" className="h-5 w-5" />
				<span>{row.original.amount} SUI</span>
			</div>
		),
	},
	{
		Header: "Note",
		accessor: "note",
		Cell: () => <NoteInput />,
	},
];

interface AuctionTableProps {
	data: Bid[];
}

export function AuctionTable({ data }: AuctionTableProps) {
	const { suiAddr } = useContext(WalletContext);

	const userBid = data.find((bid) => bid.bidder === suiAddr);
	const userPosition = userBid?.rank;

	const getDisplayData = (): Bid[] => {
		const top21 = data.slice(0, MAX_LEADERBOARD_ROWS);

		if (userPosition && userPosition > MAX_LEADERBOARD_ROWS && userBid) {
			return [...top21, userBid];
		}

		return top21;
	};

	const displayData = getDisplayData();
	const columns = createColumns();

	const getRowProps = (row: { original: Bid }) => {
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
