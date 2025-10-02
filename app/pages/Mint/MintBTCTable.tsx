import type { CellProps, Column, Row } from "react-table";
import { Table } from "~/components/ui/table";
import { Tooltip } from "~/components/ui/tooltip";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatBTC } from "~/lib/denoms";
import { type MintingTxStatus, type MintTransaction } from "~/server/Mint/types";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { CopyButton } from "~/components/ui/CopyButton";
import { ExpandableTransactionDetails } from "~/pages/Mint/ExpandableTransactionDetails";
import { AnimatedHourglass } from "~/components/ui/AnimatedHourglass";
import { useState, useMemo, useCallback } from "react";
import { useNetworkVariable } from "~/networkConfig";

function MintTableTooltip({ tooltip, label }: { tooltip: string; label: string }) {
	return (
		<Tooltip tooltip={tooltip}>
			<div className="flex items-center gap-2">
				{label}
				<Info size="16" className="text-primary transition-colors hover:text-orange-400" />
			</div>
		</Tooltip>
	);
}

function buildSuiTransactionUrl(txId: string, explorerUrl?: string, configExplorerUrl?: string): string {
	if (explorerUrl) {
		return explorerUrl;
	}

	if (configExplorerUrl) {
		return `${configExplorerUrl}/txblock/${txId}`;
	}
	return `https://testnet.suivision.xyz/txblock/${txId}`;
}

const getStatusDisplay = (status: MintingTxStatus) => {
	const isActive = ["broadcasting", "confirming", "finalized", "minting"].includes(status);
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
				<div className="flex cursor-pointer items-center gap-2 font-mono">
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
				<div className="flex cursor-pointer items-center gap-2 font-mono">
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
		Header: () => (
			<MintTableTooltip label="Sui TX" tooltip="The Sui transaction ID for the minted nBTC tokens" />
		),
		accessor: "suiTxId",
		Cell: ({ row }: CellProps<MintTransaction>) => {
			const suiTxId = row.original.suiTxId;
			const suiExplorerUrl = row.original.suiExplorerUrl;

			if (!suiTxId) {
				return <span className="text-base-content/40">-</span>;
			}

			const explorerUrl = buildSuiTransactionUrl(suiTxId, suiExplorerUrl, configExplorerUrl);

			return (
				<Tooltip tooltip={suiTxId}>
					<div className="flex items-center gap-2 font-mono">
						<a
							href={explorerUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="link text-sm text-white !no-underline hover:text-orange-400"
						>
							{trimAddress(suiTxId)}
						</a>
						<CopyButton text={suiTxId} />
					</div>
				</Tooltip>
			);
		},
	},
	{
		Header: "Details",
		id: "details",
		accessor: () => "details", // Custom accessor that doesn't conflict
		Cell: ({ row }: CellProps<MintTransaction>) => {
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

interface MintBTCTableProps {
	data: MintTransaction[];
	isLoading?: boolean;
}

export function MintBTCTable({ data, isLoading = false }: MintBTCTableProps) {
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

	const renderExpandedRow = useCallback((row: Row<MintTransaction>) => {
		return <ExpandableTransactionDetails transaction={row.original} />;
	}, []);

	const columns = useMemo(
		() => createColumns(expandedRows, toggleExpanded, explorerUrl),
		[expandedRows, toggleExpanded, explorerUrl],
	);

	return (
		<div className="w-full space-y-4">
			<Table
				header={{
					icon: "₿",
					title: "nBTC Mint Transactions",
				}}
				columns={columns}
				data={data}
				expandedRows={expandedRows}
				renderExpandedRow={renderExpandedRow}
				getRowId={(row) => row.bitcoinTxId}
				isLoading={isLoading}
				loadingMessage="Loading nBTC transactions..."
			/>
		</div>
	);
}
