import type { CellProps, Column, Row } from "react-table";
import { Table } from "~/components/ui/table";
import { Tooltip } from "~/components/ui/tooltip";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatNBTC } from "~/lib/denoms";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CopyButton } from "~/components/ui/CopyButton";
import { AnimatedHourglass } from "~/components/ui/AnimatedHourglass";
import { useState, useMemo, useCallback } from "react";
import { TableTooltip } from "./TableTooltip";
import { RedeemRequestStatus, type RedeemRequestResp } from "@gonative-cc/sui-indexer/models";
import { ExpandableRedeemDetails } from "./ExpandableRedeemDetails";

const getStatusDisplay = (status: RedeemRequestResp["status"]) => {
	const isActive = status !== RedeemRequestStatus.Solved;
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
): Column<RedeemRequestResp>[] => [
	{
		Header: () => (
			<TableTooltip label="Sui TX" tooltip="The Redeem ID ID that initiated the redeem process" />
		),
		accessor: "redeem_id",
		Cell: ({ row }: CellProps<RedeemRequestResp>) => {
			const redeemId = row.original.redeem_id;
			return <span className="text-base-content/40">{redeemId}</span>;
		},
	},
	{
		Header: () => <TableTooltip label="Amount" tooltip="The amount of nBTC being redeemed" />,
		accessor: "amount_sats",
		Cell: ({ row }: CellProps<RedeemRequestResp>) => (
			<div className="flex items-center gap-2 font-semibold">
				<span className="text-primary">{formatNBTC(BigInt(row.original.amount_sats || 0))}</span>
				<span className="text-base-content/60 text-sm">nBTC</span>
			</div>
		),
	},
	{
		Header: () => <TableTooltip label="Recipient" tooltip="The Bitcoin address where BTC will be sent" />,
		accessor: "recipient_script",
		Cell: ({ row }: CellProps<RedeemRequestResp>) => (
			<Tooltip tooltip={row.original.recipient_script}>
				<div className="link flex items-center gap-2 font-mono">
					<span className="text-sm">{trimAddress(row.original.recipient_script)}</span>
					<CopyButton text={row.original.recipient_script} />
				</div>
			</Tooltip>
		),
	},
	{
		Header: () => <TableTooltip label="Status" tooltip="Current status of the redeem transaction" />,
		accessor: "status",
		Cell: ({ row }: CellProps<RedeemRequestResp>) => getStatusDisplay(row.original.status),
	},
	// TODO: API is not sending bitcoin tx id at the moment
	// {
	// 	Header: () => (
	// 		<TableTooltip label="Bitcoin TX" tooltip="The Bitcoin transaction ID for the redeemed BTC" />
	// 	),
	// 	accessor: "bitcoinTxId",
	// 	Cell: ({ row }: CellProps<RedeemRequestResp>) => {
	// 		const bitcoinTxId = row.original.bitcoinTxId;

	// 		if (!bitcoinTxId) {
	// 			return <span className="text-base-content/40">-</span>;
	// 		}

	// 		return (
	// 			<Tooltip tooltip={bitcoinTxId}>
	// 				<div className="flex items-center gap-2 font-mono">
	// 					<span className="text-sm">{trimAddress(bitcoinTxId)}</span>
	// 					<CopyButton text={bitcoinTxId} />
	// 				</div>
	// 			</Tooltip>
	// 		);
	// 	},
	// },
	{
		Header: "Details",
		id: "details",
		accessor: () => "details",
		Cell: ({ row }: CellProps<RedeemRequestResp>) => {
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
	data: RedeemRequestResp[];
	isLoading?: boolean;
}

export function RedeemBTCTable({ data, isLoading = false }: RedeemBTCTableProps) {
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

	const renderExpandedRow = useCallback((row: Row<RedeemRequestResp>) => {
		return <ExpandableRedeemDetails transaction={row.original} />;
	}, []);

	const columns = useMemo(
		() => createColumns(expandedRows, toggleExpanded),
		[expandedRows, toggleExpanded],
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
				getRowId={(row) => String(row.redeem_id)}
				isLoading={isLoading}
				loadingMessage="Loading nBTC redeem transactions..."
			/>
		</div>
	);
}
