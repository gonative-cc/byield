import type { CellProps, Column } from "react-table";
import { SUIIcon } from "~/components/icons";
import { Table } from "~/components/ui/table";
import { trimAddress } from "~/components/Wallet/walletHelper";
import type { Raffle } from "~/server/BeelieversAuction/types";
import { formatSUI } from "~/lib/denoms";

interface AuctionRaffleTableProps {
	data: Raffle[];
}

// TODO: make it compatible with raffle
const createColumns = (): Column<Raffle>[] => [
	{
		Header: "🏆 ID",
		accessor: "id",
		Cell: ({ value }: CellProps<Raffle>) => (
			<div className="flex items-center gap-2 font-semibold">#{value}</div>
		),
	},
	{
		Header: "👤 Address",
		accessor: "address",
		Cell: ({ row }: CellProps<Raffle>) => (
			<div className="flex items-center space-x-2">
				<div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center text-xs font-bold text-black">
					{row.original.address.slice(2, 4).toUpperCase()}
				</div>
				<span className="font-mono text-sm">{trimAddress(row.original.address)}</span>
			</div>
		),
	},
	{
		Header: "💰 Amount",
		accessor: "amount",
		Cell: ({ row }: CellProps<Raffle>) => (
			<div className="flex items-center space-x-2 font-semibold">
				<SUIIcon prefix="" className="h-5 w-5 text-primary" />
				<span className="text-primary">{formatSUI(String(row.original.amount || 0))}</span>
				<span className="text-muted-foreground text-sm">SUI</span>
			</div>
		),
	},
];

export function AuctionRaffleTable({ data }: AuctionRaffleTableProps) {
	const columns = createColumns();

	return (
		<div className="w-full space-y-4">
			<Table columns={columns} data={data} />
		</div>
	);
}
