import type { CellProps, Column } from "react-table";
import { Table } from "~/components/ui/table";
import { Tooltip } from "~/components/ui/tooltip";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatBTC } from "~/lib/denoms";
import { MintingTxStatus, type MintTransaction } from "~/server/Mint/types";
import { Info } from "lucide-react";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { CopyButton } from "~/components/ui/CopyButton";

function MintTableTooltip({ tooltip, label }: { tooltip: string; label: string }) {
	return (
		<Tooltip tooltip={tooltip}>
			<div className="flex items-center gap-2">
				{label}
				<Info size="16" className="text-primary hover:text-orange-400 transition-colors" />
			</div>
		</Tooltip>
	);
}

const createColumns = (confirmationThreshold: number): Column<MintTransaction>[] => [
	{
		Header: () => (
			<MintTableTooltip
				label="Bitcoin Tx ID"
				tooltip="The Bitcoin transaction ID that initiated the mint process"
			/>
		),
		accessor: "bitcoinTxId",
		Cell: ({ value }: CellProps<MintTransaction>) => (
			<Tooltip tooltip={value}>
				<div className="flex items-center gap-2 font-semibold cursor-pointer">
					{trimAddress(value)}
					<CopyButton text={value} />
				</div>
			</Tooltip>
		),
	},
	{
		Header: () => <MintTableTooltip label="Amount" tooltip="The amount of Bitcoin being minted in BTC" />,
		accessor: "amountInSatoshi",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<div className="flex items-center space-x-2 font-semibold">
				<span className="text-primary">{formatBTC(BigInt(row.original.amountInSatoshi || 0))}</span>
				<span className="text-muted-foreground text-sm">BTC</span>
			</div>
		),
	},
	{
		Header: () => <MintTableTooltip label="Status" tooltip="Current status of the mint transaction" />,
		accessor: "status",
		Cell: ({ row }: CellProps<MintTransaction>) =>
			row.original.status === MintingTxStatus.CONFIRMING ? (
				<div className="flex items-center space-x-2 font-semibold">
					<span className="text-primary">
						{row.original.status} ({row.original.numberOfConfirmation / confirmationThreshold})
					</span>
				</div>
			) : (
				<span>{row.original.status}</span>
			),
	},
	{
		Header: () => (
			<MintTableTooltip
				label="Sui Destination Address"
				tooltip="The Sui blockchain address where nBTC will be minted"
			/>
		),
		accessor: "suiAddress",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<Tooltip tooltip={row.original.suiAddress}>
				<div className="flex items-center space-x-2 font-mono cursor-pointer">
					<span className="font-mono text-sm">{trimAddress(row.original.suiAddress)}</span>
					<CopyButton text={row.original.suiAddress} />
				</div>
			</Tooltip>
		),
	},
	{
		Header: () => (
			<MintTableTooltip label="Sui Tx ID" tooltip="The Sui transaction ID for the minted nBTC" />
		),
		accessor: "suiTxId",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<Tooltip tooltip={row.original.suiTxId}>
				<div className="flex items-center space-x-2 font-mono cursor-pointer">
					<span className="font-mono text-sm">{trimAddress(row.original.suiTxId)}</span>
					<CopyButton text={row.original.suiTxId} />
				</div>
			</Tooltip>
		),
	},
	{
		Header: () => <MintTableTooltip label="Date" tooltip="When the transaction was created" />,
		accessor: "timestamp",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<div className="flex items-center space-x-2 font-mono">
				<span className="font-mono text-sm">{new Date(row.original.timestamp).toLocaleString()}</span>
			</div>
		),
	},
];

interface MintBTCTableProps {
	data: MintTransaction[];
}

export function MintBTCTable({ data }: MintBTCTableProps) {
	const { confirmationThreshold } = useBitcoinConfig();
	const columns = createColumns(confirmationThreshold);

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
