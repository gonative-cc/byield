import React from "react";
import { useTable } from "react-table";
import type { Column, HeaderGroup, Row } from "react-table";
import { twMerge } from "tailwind-merge";
import { primaryHeadingClasses, avatarGradientClasses, GRADIENTS } from "~/util/tailwind";

const TableHead = <T extends object>({ headerGroups }: { headerGroups: HeaderGroup<T>[] }) => (
	<thead className="sticky top-0">
		{headerGroups.map((headerGroup) => (
			<tr
				{...headerGroup.getHeaderGroupProps()}
				key={headerGroup.getHeaderGroupProps().key}
				className={`text-foreground/80 ${GRADIENTS.azureTableHeader} text-sm font-semibold backdrop-blur-sm`}
			>
				{headerGroup.headers.map((column, index) => (
					<th
						{...column.getHeaderProps()}
						key={column.getHeaderProps().key}
						className={twMerge(
							"border-primary/20 hover:text-primary border-b p-4 text-left transition-colors",
							index === 0 && "rounded-tl-2xl",
							index === headerGroup.headers.length - 1 && "rounded-tr-2xl",
						)}
					>
						<div className="flex items-center gap-2">{column.render("Header")}</div>
					</th>
				))}
			</tr>
		))}
	</thead>
);

const TableRows = <T extends object>({
	rows,
	prepareRow,
	getRowProps,
	expandedRows,
	renderExpandedRow,
	columns,
}: {
	rows: Row<T>[];
	prepareRow: (row: Row<T>) => void;
	getRowProps?: (row: Row<T>) => { className?: string };
	expandedRows?: Set<string>;
	renderExpandedRow?: (row: Row<T>) => React.ReactNode;
	columns: Column<T>[];
}) => (
	<>
		{rows.map((row, index) => {
			prepareRow(row);
			const customRowProps = getRowProps?.(row) || {};
			const isExpanded = expandedRows?.has(row.id);
			const isLastRow = index === rows.length - 1;

			const rowProps = row.getRowProps();
			const { key, ...restRowProps } = rowProps;

			return (
				<React.Fragment key={key}>
					<tr
						{...restRowProps}
						className={twMerge(
							"hover:bg-primary/5 group border-t border-gray-700/30 text-sm transition-colors",
							customRowProps.className,
						)}
					>
						{row.cells.map((cell, cellIndex) => {
							const cellProps = cell.getCellProps();
							const { key: cellKey, ...restCellProps } = cellProps;
							return (
								<td
									{...restCellProps}
									key={cellKey}
									className={twMerge(
										"group-hover:text-foreground p-4 transition-colors",
										cellIndex === 0 && isLastRow && !isExpanded && "rounded-bl-2xl",
										cellIndex === row.cells.length - 1 &&
											isLastRow &&
											!isExpanded &&
											"rounded-br-2xl",
									)}
								>
									{cell.render("Cell")}
								</td>
							);
						})}
					</tr>
					{isExpanded && renderExpandedRow && (
						<tr className="border-t border-gray-700/30">
							<td
								colSpan={columns.length}
								className={twMerge("p-0", isLastRow && "rounded-b-2xl")}
							>
								{renderExpandedRow(row)}
							</td>
						</tr>
					)}
				</React.Fragment>
			);
		})}
	</>
);

interface TableProps<T extends object> {
	header?: {
		icon?: string;
		iconPath?: string;
		title?: string;
	};
	columns: Column<T>[];
	data: T[];
	className?: string;
	getRowProps?: (row: Row<T>) => { className?: string };
	expandedRows?: Set<string>;
	renderExpandedRow?: (row: Row<T>) => React.ReactNode;
	getRowId?: (row: T) => string;
	isLoading?: boolean;
	loadingMessage?: string;
}

export const Table = <T extends object>({
	header,
	columns,
	data,
	className,
	getRowProps,
	expandedRows,
	renderExpandedRow,
	getRowId,
	isLoading = false,
	loadingMessage = "Loading...",
}: TableProps<T>) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<T>({
		columns,
		data,
		getRowId:
			getRowId ||
			((row: T, index: number) => {
				// Default fallback - try common ID properties or use index
				const record = row as Record<string, unknown>;
				return (typeof record.id === "string" ? record.id : null) || index.toString();
			}),
	});
	const isTableEmpty = !data.length;
	const renderNoDataMessage = (
		<tr className="animate-in fade-in-0 duration-500">
			<td colSpan={columns.length} className="text-base-content/75 p-8 text-center text-base">
				<div className="flex flex-col items-center gap-3">
					<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
						<span className="text-2xl">📊</span>
					</div>
					<p>No data available</p>
				</div>
			</td>
		</tr>
	);

	const renderLoadingMessage = (
		<tr className="animate-in fade-in-0 duration-500">
			<td colSpan={columns.length} className="text-base-content/75 p-8 text-center text-base">
				<div className="flex flex-col items-center gap-3">
					<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
						<div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
					</div>
					<p>{loadingMessage}</p>
				</div>
			</td>
		</tr>
	);

	return (
		<>
			{header && (
				<div className="flex flex-col items-start justify-between gap-4 px-2 pt-4 sm:flex-row sm:items-center">
					<div className="flex items-center gap-3">
						{header.icon && (
							<div className={avatarGradientClasses()}>
								<span className="text-xl">{header.icon}</span>
							</div>
						)}
						{header.iconPath && (
							<div className={avatarGradientClasses()}>
								<img src={header.iconPath} alt="" className="h-8 w-8 pl-1" />
							</div>
						)}
						{header.title && (
							<div>
								<h2 className={primaryHeadingClasses()}>{header.title}</h2>
							</div>
						)}
					</div>
				</div>
			)}
			<div
				className={twMerge(
					"border-primary/10 w-full overflow-hidden rounded-2xl border shadow-2xl",
					className,
				)}
			>
				<div className="overflow-x-auto">
					<table
						{...getTableProps()}
						className={`${GRADIENTS.azureTable} w-full min-w-[600px] text-left`}
					>
						<TableHead headerGroups={headerGroups} />
						<tbody {...getTableBodyProps()}>
							{isLoading ? (
								renderLoadingMessage
							) : isTableEmpty ? (
								renderNoDataMessage
							) : (
								<TableRows
									rows={rows}
									prepareRow={prepareRow}
									getRowProps={getRowProps}
									expandedRows={expandedRows}
									renderExpandedRow={renderExpandedRow}
									columns={columns}
								/>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};
