import { CopyButton } from "./CopyButton";
import { trimAddress } from "../Wallet/walletHelper";

interface TableData {
	name: string;
	address: string;
	amount: number;
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
	children?: React.ReactNode;
}

export function ReserveCard({
	title,
	value,
	unit,
	isLoading,
	addressLabel,
	address,
	tableData,
	children,
}: ReserveCardProps) {
	return (
		<div className="card md:min-w-96">
			<div className="card-body">
				<p className="text-base-content/60 text-sm font-medium tracking-wide">{title}</p>

				{isLoading ? (
					<div className="skeleton h-8 w-40" />
				) : children ? (
					children
				) : (
					<div className="flex items-center gap-3">
						<p className="text-primary text-2xl font-bold sm:text-3xl">
							{value} {unit}
						</p>
					</div>
				)}

				{tableData && (
					<div className="mt-4 overflow-x-auto">
						<table className="table-sm table">
							<thead>
								<tr>
									<th className="text-base-content/75 font-medium">Name</th>
									<th className="text-base-content/75 font-medium">Address</th>
									<th className="text-base-content/75 text-right font-medium">Amount</th>
								</tr>
							</thead>
							<tbody>
								{tableData.map((item) => (
									<tr key={item.address} className="hover:bg-base-200/50 border-base-300">
										<td className="font-medium">{item.name}</td>
										<td className="font-mono text-sm">{trimAddress(item.address)}</td>
										<td className="text-right font-medium">
											{item.amount} {item.unit}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{address && (
					<>
						<div className="divider" />
						<p className="text-base-content/75 flex items-center gap-2 text-sm break-all">
							{addressLabel}: {trimAddress(address)} <CopyButton text={address} />
						</p>
					</>
				)}
			</div>
		</div>
	);
}
