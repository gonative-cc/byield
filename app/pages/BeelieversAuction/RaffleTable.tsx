import type { CellProps, Column } from "react-table";
import { Table } from "~/components/ui/table";
import { trimAddress } from "~/components/Wallet/walletHelper";
import type { Raffle } from "~/server/BeelieversAuction/types";
import { formatBTC } from "~/lib/denoms";

interface RaffleTableProps {
	data: Raffle[];
}

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
			<div className="flex items-center space-x-2 font-mono">
				<span className="font-mono text-sm">{trimAddress(row.original.address)}</span>
			</div>
		),
	},
	{
		Header: "💰 Amount",
		accessor: "amount",
		Cell: ({ row }: CellProps<Raffle>) => (
			<div className="flex items-center space-x-2 font-semibold">
				<span className="text-primary">{formatBTC(row.original.amount || 0)}</span>
				<span className="text-base-content/75 text-sm">nBTC</span>
			</div>
		),
	},
];

export function RaffleTable({ data }: RaffleTableProps) {
	const columns = createColumns();

	return (
		<div className="w-full space-y-4">
			<Table columns={columns} data={data} />
		</div>
	);
}
