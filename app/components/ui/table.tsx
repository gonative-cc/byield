import { useTable } from "react-table";
import type { Column, HeaderGroup, Row } from "react-table";
import { twMerge } from "tailwind-merge";

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
}: {
	rows: Row<T>[];
	prepareRow: (row: Row<T>) => void;
	getRowProps?: (row: Row<T>) => { className?: string };
}) =>
	rows.map((row, index) => {
		prepareRow(row);
		const customRowProps = getRowProps?.(row) || {};
		return (
			<tr
				{...row.getRowProps()}
				key={row.getRowProps().key}
				className={twMerge(
					"border-t border-gray-700/30 text-sm hover:bg-primary/5 transition-all duration-200 group animate-in slide-in-from-left-2",
					customRowProps.className,
				)}
				style={{ animationDelay: `${index * 50}ms` }}
			>
				{row.cells.map((cell, cellIndex) => (
					<td
						{...cell.getCellProps()}
						key={cell.getCellProps().key}
						className={twMerge(
							"p-4 group-hover:text-foreground transition-colors",
							cellIndex === 0 && index === rows.length - 1 && "rounded-bl-2xl",
							cellIndex === row.cells.length - 1 &&
								index === rows.length - 1 &&
								"rounded-br-2xl",
						)}
					>
						{cell.render("Cell")}
					</td>
				))}
			</tr>
		);
	});

interface TableProps<T extends object> {
	header?: {
		icon?: string;
		title?: string;
	};
	columns: Column<T>[];
	data: T[];
	className?: string;
	getRowProps?: (row: Row<T>) => { className?: string };
}

export const Table = <T extends object>({ header, columns, data, className, getRowProps }: TableProps<T>) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<T>({
		columns,
		data,
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

	return (
		<>
			{header && (
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 pt-4">
					<div className="flex items-center gap-3">
						{header.icon && (
							<div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center">
								<span className="text-xl">{header.icon}</span>
							</div>
						)}
						{header.title && (
							<div>
								<h2 className="text-2xl font-bold text-primary">{header.title}</h2>
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
							{isTableEmpty ? (
								renderNoDataMessage
							) : (
								<TableRows rows={rows} prepareRow={prepareRow} getRowProps={getRowProps} />
							)}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};
