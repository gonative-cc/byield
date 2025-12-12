import type { CellProps, Column, Row } from "react-table";
import { Table } from "~/components/ui/table";
import { Tooltip } from "~/components/ui/tooltip";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatNBTC } from "~/lib/denoms";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { CopyButton } from "~/components/ui/CopyButton";
import { AnimatedHourglass } from "~/components/ui/AnimatedHourglass";
import { useState, useMemo, useCallback } from "react";
import { useNetworkVariable } from "~/networkConfig";
import { RedeemNBTCStatus, type RedeemTransaction } from "~/server/nbtc/types";

function RedeemTableTooltip({ tooltip, label }: { tooltip: string; label: string }) {
	return (
		<Tooltip tooltip={tooltip}>
			<div className="flex items-center gap-2">
				{label}
				<Info size="16" className="text-primary-foreground hover:text-primary transition-colors" />
			</div>
		</Tooltip>
	);
}

const getStatusDisplay = (status: RedeemTransaction["status"]) => {
	const isActive = status !== RedeemNBTCStatus.COMPLETED;
	return (
		<div className="flex items-center gap-2">
			{isActive && <AnimatedHourglass size="md" />}
			<span className="badge capitalize">{status}</span>
		</div>
	);
};

const createColumns = (
	expandedRows: Set<string>,
	toggleExpanded: (txId: string) => void,
	configExplorerUrl?: string,
): Column<RedeemTransaction>[] => [
	{
		Header: () => (
			<RedeemTableTooltip
				label="Sui TX"
				tooltip="The Sui transaction ID that initiated the redeem process"
			/>
		),
		accessor: "suiTxId",
		Cell: ({ value }: CellProps<RedeemTransaction>) => (
			<Tooltip tooltip={value}>
				<div className="link flex items-center gap-2 font-mono">
					<span className="text-sm">{trimAddress(value)}</span>
					<CopyButton text={value} />
				</div>
			</Tooltip>
		),
	},
	{
		Header: () => <RedeemTableTooltip label="Amount" tooltip="The amount of nBTC being redeemed" />,
		accessor: "amountInSatoshi",
		Cell: ({ row }: CellProps<RedeemTransaction>) => (
			<div className="flex items-center gap-2 font-semibold">
				<span className="text-primary">{formatNBTC(BigInt(row.original.amountInSatoshi || 0))}</span>
				<span className="text-base-content/60 text-sm">nBTC</span>
			</div>
		),
	},
	{
		Header: () => (
			<RedeemTableTooltip label="Recipient" tooltip="The Bitcoin address where BTC will be sent" />
		),
		accessor: "bitcoinAddress",
		Cell: ({ row }: CellProps<RedeemTransaction>) => (
			<Tooltip tooltip={row.original.bitcoinAddress}>
				<div className="link flex items-center gap-2 font-mono">
					<span className="text-sm">{trimAddress(row.original.bitcoinAddress)}</span>
					<CopyButton text={row.original.bitcoinAddress} />
				</div>
			</Tooltip>
		),
	},
	{
		Header: () => (
			<RedeemTableTooltip label="Status" tooltip="Current status of the redeem transaction" />
		),
		accessor: "status",
		Cell: ({ row }: CellProps<RedeemTransaction>) => getStatusDisplay(row.original.status),
	},
	{
		Header: () => (
			<RedeemTableTooltip
				label="Bitcoin TX"
				tooltip="The Bitcoin transaction ID for the redeemed BTC"
			/>
		),
		accessor: "bitcoinTxId",
		Cell: ({ row }: CellProps<RedeemTransaction>) => {
			const bitcoinTxId = row.original.bitcoinTxId;

			if (!bitcoinTxId) {
				return <span className="text-base-content/40">-</span>;
			}

			return (
				<Tooltip tooltip={bitcoinTxId}>
					<div className="flex items-center gap-2 font-mono">
						<span className="text-sm">{trimAddress(bitcoinTxId)}</span>
						<CopyButton text={bitcoinTxId} />
					</div>
				</Tooltip>
			);
		},
	},
	{
		Header: "Details",
		id: "details",
		accessor: () => "details",
		Cell: ({ row }: CellProps<RedeemTransaction>) => {
			const isExpanded = expandedRows.has(row.id);
			return (
				<button
					onClick={() => {
						toggleExpanded(row.id);
					}}
					className="btn btn-ghost btn-sm"
					aria-label={isExpanded ? "Collapse details" : "Expand details"}
				>
					{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
				</button>
			);
		},
	},
];

interface RedeemBTCTableProps {
	data: RedeemTransaction[];
	isLoading?: boolean;
}

export function RedeemBTCTable({ data, isLoading = false }: RedeemBTCTableProps) {
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
	const explorerUrl = useNetworkVariable("explorer");

	const toggleExpanded = useCallback((txId: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(txId)) {
				newSet.delete(txId);
			} else {
				newSet.add(txId);
			}
			return newSet;
		});
	}, []);

	const renderExpandedRow = useCallback((row: Row<RedeemTransaction>) => {
		// TODO: For now, use the same expandable details component
		// In the future, create a specific one for redeem transactions
		return <div className="p-4 text-sm">Redeem transaction details coming soon...</div>;
	}, []);

	const columns = useMemo(
		() => createColumns(expandedRows, toggleExpanded, explorerUrl),
		[expandedRows, toggleExpanded, explorerUrl],
	);

	return (
		<div className="w-full space-y-4">
			<Table
				header={{
					iconPath: "/assets/navigation/nBTC.svg",
					title: "Your nBTC Redeem Transactions",
				}}
				columns={columns}
				data={data}
				expandedRows={expandedRows}
				renderExpandedRow={renderExpandedRow}
				getRowId={(row) => row.suiTxId}
				isLoading={isLoading}
				loadingMessage="Loading nBTC redeem transactions..."
			/>
		</div>
	);
}
