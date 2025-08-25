import type { CellProps, Column } from "react-table";
import { SUIIcon } from "~/components/icons";
import { Table } from "~/components/ui/table";
import { trimAddress } from "~/components/Wallet/walletHelper";
import type { Bidder } from "~/server/BeelieversAuction/types";
import { formatSUI } from "~/lib/denoms";

interface AuctionRaffleTableProps {
	data: Bidder[];
}

// TODO: make it compatible with raffle
const createColumns = (): Column<Bidder>[] => [
	{
		Header: "🏆 ID",
		accessor: "rank",
		Cell: ({ value }: CellProps<Bidder>) => (
			<div className="flex items-center gap-2 font-semibold">#{value}</div>
		),
	},
	{
		Header: "👤 Address",
		accessor: "bidder",
		Cell: ({ row }: CellProps<Bidder>) => (
			<div className="flex items-center space-x-2">
				<div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center text-xs font-bold text-black">
					{row.original.bidder.slice(2, 4).toUpperCase()}
				</div>
				<span className="font-mono text-sm">{trimAddress(row.original.bidder)}</span>
			</div>
		),
	},
	{
		Header: "💰 Amount",
		accessor: "amount",
		Cell: ({ row }: CellProps<Bidder>) => (
			<div className="flex items-center space-x-2 font-semibold">
				<SUIIcon prefix="" className="h-5 w-5 text-primary" />
				<span className="text-primary">{formatSUI(String(row.original.amount))}</span>
				<span className="text-muted-foreground text-sm">SUI</span>
			</div>
		),
	},
];

export function AuctionRaffleTable({ data }: AuctionRaffleTableProps) {
	const getDisplayData = (): Bidder[] => {
		// TODO: get raffle data
		return [];
	};

	// TODO: raffle data
	const displayData = getDisplayData();
	const columns = createColumns();

	return (
		<div className="w-full space-y-4">
			<Table columns={columns} data={displayData} />
		</div>
	);
}
