import { Zap } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Table } from "./ui/table";
import type { Column, CellProps } from "react-table";
import { Badge } from "./ui/badge";
import { Link } from "react-router";
import { SelectInput } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { action } from "../config/market.json";
import { useNBTCBalance } from "./Wallet/SuiWallet/useNBTCBalance";
import { formatNBTC } from "~/lib/denoms";

enum MarketIntegration {
	TURBOS = "TURBOS",
}

interface DepositData {
	id: string;
	title: string;
	value: string;
}

interface DApp {
	name: string;
	type: string;
	integration: MarketIntegration;
	labels: string[];
	apy: number;
	chain: string;
	logo: string;
}

const getActionLinks = (integration: MarketIntegration) => {
	switch (integration) {
		case MarketIntegration.TURBOS:
			return action.turbos;
		default:
			return "";
	}
};

export const columns: Column<DApp>[] = [
	{
		Header: "Vault Name",
		accessor: "name",
		Cell: ({ value, row }: CellProps<DApp>) => (
			<div className="flex items-center gap-2">
				<img src={row.original.logo} alt={value} className="h-6 w-6 object-contain" />
				{value}
			</div>
		),
	},
	{
		Header: "Type",
		accessor: "type",
		Cell: ({ row }: CellProps<DApp>) => (
			<div className="flex space-x-2">
				<Badge variant="secondary">{row.original.type}</Badge>
			</div>
		),
	},
	{
		Header: "Label",
		accessor: "labels",
		Cell: ({ row }: CellProps<DApp>) => (
			<div className="flex space-x-2">
				{row.original.labels.map((label) => (
					<div key={label}>
						<Badge className="flex gap-2 justify-between">
							<Zap size={16} />
							{label}
						</Badge>
					</div>
				))}
			</div>
		),
	},
	{
		Header: "7 Day APY",
		accessor: "apy",
		Cell: ({ row }: CellProps<DApp>) => (
			<div className="flex space-x-2">
				<span>{row.original.apy}%</span>
			</div>
		),
	},
	{ Header: "Chain", accessor: "chain" },
	{
		Header: "Action",
		Cell: ({
			row: {
				original: { integration },
			},
		}: CellProps<DApp>) => {
			const action = getActionLinks(integration);
			if (!action) return null;
			return (
				<div className="flex space-x-2">
					<Link to={action.trade} target="_blank">
						<Button variant="secondary">Trade nBTC</Button>
					</Link>
					<Link to={action.deposit} target="_blank">
						<Button variant="ghost">Deposit</Button>
					</Link>
				</div>
			);
		},
	},
];

function DepositCard({ title, value }: DepositData) {
	return (
		<Card className="flex flex-1 max-w-1/4">
			<CardContent className="p-6 rounded-lg text-white flex flex-col gap-2 bg-azure-10 w-full">
				<div className="flex gap-2">
					<span className="text-base font-medium">{title}</span>
				</div>
				<span className="text-base font-medium">{value}</span>
			</CardContent>
		</Card>
	);
}

export function TotalDeposit() {
	const { balance: nBTCBalance } = useNBTCBalance();

	return (
		<div className="flex flex-col gap-10 w-full">
			<div className="flex justify-between w-full gap-4">
				{nBTCBalance && (
					<DepositCard
						id="nbtc-balance"
						title="nBTC Balance"
						value={formatNBTC(BigInt(nBTCBalance.totalBalance))}
					/>
				)}
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-center w-full">
					<h1 className="text-2xl font-bold text-orange-500 mr-4">Markets</h1>
					<div className="flex gap-4 justify-end w-full">
						<SelectInput
							options={[{ label: "Filter by Top APY", value: "filterbytop" }]}
							placeholder="Filter by Top APY"
						/>
						<Input type="text" placeholder="Search vaults..." />
					</div>
				</div>
				<Table columns={columns} data={VAULTS} />
			</div>
		</div>
	);
}

const VAULTS: DApp[] = [
	{
		name: "Turbos",
		type: "DEX",
		integration: MarketIntegration.TURBOS,
		labels: ["Farming"],
		apy: 11.71,
		chain: "SUI",
		logo: "/assets/ui-icons/market/turbos.svg",
	},
];
