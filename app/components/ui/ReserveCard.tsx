import { CopyButton } from "./CopyButton";
import { trimAddress } from "../Wallet/walletHelper";

interface TableData {
	name: string;
	address: string;
	amount: string;
	unit: string;
}

interface ReserveCardProps {
	title: string;
	value: string | number;
	unit: string;
	isLoading: boolean;
	addressLabel?: string;
	address?: string;
	tableData?: TableData[];
}

export function ReserveCard({
	title,
	value,
	unit,
	isLoading,
	addressLabel,
	address,
	tableData,
}: ReserveCardProps) {
	const shouldShowTable = !isLoading && tableData && tableData.length > 0;

	return (
		<div className="card md:min-h-54 md:min-w-96">
			<div className="card-body justify-between">
				<div className="flex flex-col gap-4">
					<span className="text-base-content/60 text-sm font-medium tracking-wide">{title}</span>

					{isLoading ? (
						<div className="skeleton h-8 w-40" />
					) : (
							<p className="flex items-center gap-3 text-primary text-2xl font-bold sm:text-3xl">
								{value} {unit}
							</p>
					)}

					{shouldShowTable && (
						<div className="mt-4 overflow-x-auto">
							<table className="table-sm table">
								<thead>
									<tr className="font-medium">
										<th>Name</th>
										<th>Address</th>
										<th className="text-right">
											Amount
										</th>
									</tr>
								</thead>
								<tbody>
									{tableData.map((item) => (
										<tr
											key={item.address}
											className="font-medium"
										>
											<td>{item.name}</td>
											<td className="font-mono text-sm">{trimAddress(item.address)}</td>
											<td className="text-right">
												{item.amount} {item.unit}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{address && (
					<div className="space-y-2">
						<div className="divider" />
						<p className="text-base-content/75 flex items-center gap-2 text-sm break-all">
							{addressLabel}: {trimAddress(address)} <CopyButton text={address} />
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
