import { useTable, Column, HeaderGroup, Row } from "react-table";

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
}: {
	rows: Row<T>[];
	prepareRow: (row: Row<T>) => void;
}) =>
	rows.map((row) => {
		prepareRow(row);
		return (
			<tr
				{...row.getRowProps()}
				key={row.getRowProps().key}
				className="border-t border-gray-700 text-[13px]"
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
}

export const Table = <T extends object>({ columns, data }: TableProps<T>) => {
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
		<div className="overflow-x-auto">
			<table {...getTableProps()} className="w-full text-left bg-azure-10 rounded-3xl">
				<TableHead headerGroups={headerGroups} />
				<tbody {...getTableBodyProps()}>
					{isTableEmpty ? renderNoDataMessage : <TableRows rows={rows} prepareRow={prepareRow} />}
				</tbody>
			</table>
		</div>
	);
};
