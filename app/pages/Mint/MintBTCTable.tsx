import type { CellProps, Column } from "react-table";
import { Table } from "~/components/ui/table";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatBTC } from "~/lib/denoms";
import type { MintTransaction } from "~/server/Mint/types";

interface MintBTCTableProps {
	data: MintTransaction[];
}

const createColumns = (): Column<MintTransaction>[] => [
	{
		Header: "BitCoin Tx ID",
		accessor: "bitcoinTxId",
		Cell: ({ value }: CellProps<MintTransaction>) => (
			<div className="flex items-center gap-2 font-semibold">{trimAddress(value)}</div>
		),
	},
	{
		Header: "Amount",
		accessor: "amountInSatoshi",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<div className="flex items-center space-x-2 font-semibold">
				<span className="text-primary">{formatBTC(BigInt(row.original.amountInSatoshi || 0))}</span>
				<span className="text-muted-foreground text-sm">BTC</span>
			</div>
		),
	},
	{
		Header: "Status",
		accessor: "status",
	},
	{
		Header: "Sui Destination Address",
		accessor: "suiAddress",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<div className="flex items-center space-x-2 font-mono">
				<span className="font-mono text-sm">{trimAddress(row.original.suiAddress)}</span>
			</div>
		),
	},
	{
		Header: "Sui Tx ID",
		accessor: "suiTxId",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<div className="flex items-center space-x-2 font-mono">
				<span className="font-mono text-sm">{trimAddress(row.original.suiTxId)}</span>
			</div>
		),
	},
	{
		Header: "Timestamp",
		accessor: "timestamp",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<div className="flex items-center space-x-2 font-mono">
				<span className="font-mono text-sm">{row.original.timestamp}</span>
			</div>
		),
	},
];

export function MintBTCTable({ data }: MintBTCTableProps) {
	const columns = createColumns();

	return (
		<div className="w-full space-y-4">
			<Table
				columns={columns}
				data={data}
				header={{
					icon: "₿",
					title: "nBTC Mint Transactions",
				}}
			/>
		</div>
	);
}
