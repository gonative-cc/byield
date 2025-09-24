import React from "react";
import { useTable } from "react-table";
import type { Column, HeaderGroup, Row } from "react-table";
import { twMerge } from "tailwind-merge";
import { primaryHeadingClasses, avatarGradientClasses } from "~/util/tailwind";

const TableHead = <T extends object>({ headerGroups }: { headerGroups: HeaderGroup<T>[] }) => (
	<thead className="sticky top-0 z-10">
		{headerGroups.map((headerGroup) => (
			<tr
				{...headerGroup.getHeaderGroupProps()}
				key={headerGroup.getHeaderGroupProps().key}
				className="text-foreground/80 font-semibold text-sm bg-gradient-to-r from-azure-15 to-azure-20 backdrop-blur-sm"
			>
				{headerGroup.headers.map((column, index) => (
					<th
						{...column.getHeaderProps()}
						key={column.getHeaderProps().key}
						className={twMerge(
							"p-4 text-left border-b border-primary/20 transition-colors hover:text-primary",
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
				<React.Fragment key={row.id}>
					<tr
						{...restRowProps}
						className={twMerge(
							"border-t border-gray-700/30 text-sm hover:bg-primary/5 transition-colors group",
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
										"p-4 group-hover:text-foreground transition-colors",
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
			<td colSpan={columns.length} className="p-8 text-center text-base text-muted-foreground">
				<div className="flex flex-col items-center gap-3">
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
						<span className="text-2xl">📊</span>
					</div>
					<p>No data available</p>
				</div>
			</td>
		</tr>
	);

	const renderLoadingMessage = (
		<tr className="animate-in fade-in-0 duration-500">
			<td colSpan={columns.length} className="p-8 text-center text-base text-muted-foreground">
				<div className="flex flex-col items-center gap-3">
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
					</div>
					<p>{loadingMessage}</p>
				</div>
			</td>
		</tr>
	);

	return (
		<>
			{header && (
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 pt-4">
					<div className="flex items-center gap-3">
						{header.icon && (
							<div className={avatarGradientClasses()}>
								<span className="text-xl">{header.icon}</span>
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
					"w-full overflow-hidden rounded-2xl shadow-2xl border border-primary/10",
					className,
				)}
			>
				<div className="overflow-x-auto">
					<table
						{...getTableProps()}
						className="w-full text-left bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20 min-w-[600px]"
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
