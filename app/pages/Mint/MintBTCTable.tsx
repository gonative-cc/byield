import type { CellProps, Column, Row } from "react-table";
import { Table } from "~/components/ui/table";
import { Tooltip } from "~/components/ui/tooltip";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatBTC } from "~/lib/denoms";
import { type NbtcTxStatus, type MintTransaction } from "~/server/Mint/types";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { CopyButton } from "~/components/ui/CopyButton";
import { ExpandableTransactionDetails } from "~/components/ui/ExpandableTransactionDetails";
import { AnimatedHourglass } from "~/components/ui/AnimatedHourglass";
import { useState } from "react";

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

const getStatusDisplay = (status: NbtcTxStatus) => {
	switch (status) {
		case "confirming":
			return (
				<div className="flex items-center gap-2">
					<AnimatedHourglass size={16} />
					<span className="badge">Confirming</span>
				</div>
			);
		case "finalized":
			return (
				<div className="flex items-center gap-2">
					<AnimatedHourglass size={16} />
					<span className="badge">Finalized</span>
				</div>
			);
		case "minted":
			return (
				<div className="flex items-center gap-2">
					<span className="badge">Minted</span>
				</div>
			);
		case "failed":
			return (
				<div className="flex items-center gap-2">
					<span className="badge">Failed</span>
				</div>
			);
		case "reorg":
			return (
				<div className="flex items-center gap-2">
					<span className="badge">Reorg</span>
				</div>
			);
		default:
			return (
				<div className="flex items-center gap-2">
					<span className="badge">{status}</span>
				</div>
			);
	}
};

const createColumns = (
	expandedRows: Set<string>,
	toggleExpanded: (txId: string) => void,
): Column<MintTransaction>[] => [
	{
		Header: () => (
			<MintTableTooltip
				label="Bitcoin TX"
				tooltip="The Bitcoin transaction ID that initiated the mint process"
			/>
		),
		accessor: "bitcoinTxId",
		Cell: ({ value }: CellProps<MintTransaction>) => (
			<Tooltip tooltip={value}>
				<div className="flex items-center gap-2 font-mono cursor-pointer">
					<span className="text-sm">{trimAddress(value)}</span>
					<CopyButton text={value} />
				</div>
			</Tooltip>
		),
	},
	{
		Header: () => <MintTableTooltip label="Amount" tooltip="The amount of Bitcoin being minted in BTC" />,
		accessor: "amountInSatoshi",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<div className="flex items-center gap-2 font-semibold">
				<span className="text-primary">{formatBTC(BigInt(row.original.amountInSatoshi || 0))}</span>
				<span className="text-base-content/60 text-sm">BTC</span>
			</div>
		),
	},
	{
		Header: () => (
			<MintTableTooltip
				label="Recipient"
				tooltip="The Sui blockchain address where nBTC will be minted"
			/>
		),
		accessor: "suiAddress",
		Cell: ({ row }: CellProps<MintTransaction>) => (
			<Tooltip tooltip={row.original.suiAddress}>
				<div className="flex items-center gap-2 font-mono cursor-pointer">
					<span className="text-sm">{trimAddress(row.original.suiAddress)}</span>
					<CopyButton text={row.original.suiAddress} />
				</div>
			</Tooltip>
		),
	},
	{
		Header: () => <MintTableTooltip label="Status" tooltip="Current status of the mint transaction" />,
		accessor: "status",
		Cell: ({ row }: CellProps<MintTransaction>) => getStatusDisplay(row.original.status),
	},
	{
		Header: "Details",
		id: "details",
		accessor: () => "details", // Custom accessor that doesn't conflict
		Cell: ({ row }: CellProps<MintTransaction>) => {
			const isExpanded = expandedRows.has(row.original.bitcoinTxId);
			return (
				<button
					onClick={() => toggleExpanded(row.original.bitcoinTxId)}
					className="btn btn-ghost btn-sm"
					aria-label={isExpanded ? "Collapse details" : "Expand details"}
				>
					{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
				</button>
			);
		},
	},
];

interface MintBTCTableProps {
	data: MintTransaction[];
}

export function MintBTCTable({ data }: MintBTCTableProps) {
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	const toggleExpanded = (txId: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(txId)) {
				newSet.delete(txId);
			} else {
				newSet.add(txId);
			}
			return newSet;
		});
	};

	const renderExpandedRow = (row: Row<MintTransaction>) => {
		return <ExpandableTransactionDetails transaction={row.original} />;
	};

	const columns = createColumns(expandedRows, toggleExpanded);

	return (
		<div className="w-full space-y-4">
			<Table
				columns={columns}
				data={data}
				expandedRows={expandedRows}
				renderExpandedRow={renderExpandedRow}
				header={{
					icon: "₿",
					title: "nBTC Mint Transactions",
				}}
			/>
		</div>
	);
}
