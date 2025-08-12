import { useTable } from "react-table";
import type { Column, HeaderGroup, Row } from "react-table";
import { twMerge } from "tailwind-merge";

const TableHead = <T extends object>({ headerGroups }: { headerGroups: HeaderGroup<T>[] }) => (
	<thead>
		{headerGroups.map((headerGroup) => (
			<tr
				{...headerGroup.getHeaderGroupProps()}
				key={headerGroup.getHeaderGroupProps().key}
				className="text-[#FFFFFFCC] font-medium text-[13px]"
			>
				{headerGroup.headers.map((column) => (
					<th {...column.getHeaderProps()} key={column.getHeaderProps().key} className="p-3">
						{column.render("Header")}
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
	rows.map((row) => {
		prepareRow(row);
		const customRowProps = getRowProps?.(row) || {};
		return (
			<tr
				{...row.getRowProps()}
				key={row.getRowProps().key}
				className={twMerge("border-t border-gray-700 text-[13px]", customRowProps.className)}
			>
				{row.cells.map((cell) => (
					<td {...cell.getCellProps()} key={cell.getCellProps().key} className="p-3">
						{cell.render("Cell")}
					</td>
				))}
			</tr>
		);
	});

interface TableProps<T extends object> {
	columns: Column<T>[];
	data: T[];
	className?: string;
	getRowProps?: (row: Row<T>) => { className?: string };
}

export const Table = <T extends object>({ columns, data, className, getRowProps }: TableProps<T>) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<T>({
		columns,
		data,
	});
	const isTableEmpty = !data.length;
	const renderNoDataMessage = (
		<tr>
			<td colSpan={columns.length} className="p-3 text-center text-[13px] text-[#FFFFFFCC]">
				No data available
			</td>
		</tr>
	);

	return (
		<div className={twMerge("flex w-full overflow-x-auto", className)}>
			<table {...getTableProps()} className="w-full text-left bg-azure-10 rounded-3xl">
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
	);
};
