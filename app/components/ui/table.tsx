import { useTable, Column } from "react-table";

interface TableProps<T extends object> {
	columns: Column<T>[];
	data: T[];
}

export const Table = <T extends object>({ columns, data }: TableProps<T>) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<T>({
		columns,
		data,
	});
	const isTableEmpty = data.length === 0;
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
				<thead>
					{headerGroups.map((headerGroup) => (
						<tr
							{...headerGroup.getHeaderGroupProps()}
							key={headerGroup.id}
							className="text-[#FFFFFFCC] font-medium text-[13px]"
						>
							{headerGroup.headers.map((column) => (
								<th {...column.getHeaderProps()} key={column.id} className="p-3">
									{column.render("Header")}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{isTableEmpty
						? renderNoDataMessage
						: rows.map((row) => {
								prepareRow(row);
								return (
									<tr
										{...row.getRowProps()}
										key={row.id}
										className="border-t border-gray-700 text-[13px]"
									>
										{row.cells.map((cell, index) => (
											<td {...cell.getCellProps()} key={row.id + index} className="p-3">
												{cell.render("Cell")}
											</td>
										))}
									</tr>
								);
							})}
				</tbody>
			</table>
		</div>
	);
};
