import { Info, Zap } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Table } from "./ui/table";
import { Column, CellProps } from "react-table";
import { Badge } from "./ui/badge";
import { Link } from "react-router";
import { SelectInput } from "./ui/select";
import { Input } from "./ui/input";

interface DepositData {
	id: string;
	title: string;
	value: string;
	tooltip: string;
}

interface DApp {
	name: string;
	type: string;
	labels: string[];
	apy: number;
	chain: string;
	logo: string;
}

export const columns: Column<DApp>[] = [
	{
		Header: "Vault Name",
		accessor: "name",
		Cell: ({ value, row }: CellProps<DApp>) => (
			<div className="flex items-center gap-2">
				<img src={row.original.logo} alt={value} />
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
		Cell: () => (
			<div className="flex space-x-2">
				{/* TODO: replace hard coded colors when theme design is ready */}
				<Link to="#" className="bg-azure-15 px-4 py-2 rounded border border-[#FAFAFA14]">
					<span className="text-[#FFFFFFCC]">Deposit</span>
				</Link>
				<Link to="#" className="bg-azure-10 px-4 py-2 rounded border border-[#FAFAFA14]">
					<span className="text-[#FFFFFF80]">Withdraw</span>
				</Link>
			</div>
		),
	},
];

function DepositCard({ title, value, tooltip }: DepositData) {
	return (
		<Card className="flex flex-1">
			<CardContent className="p-6 rounded-lg text-white flex flex-col gap-2 bg-azure-10 w-full">
				<div className="flex gap-2">
					<span className="text-base font-medium">{title}</span>
					<TooltipTrigger>
						<Info />
					</TooltipTrigger>
					<TooltipContent>
						<p>{tooltip}</p>
					</TooltipContent>
				</div>
				<span className="text-base font-medium">{value}</span>
			</CardContent>
		</Card>
	);
}

export function TotalDeposit() {
	return (
		<div className="flex flex-col gap-10 w-full">
			<div className="flex justify-between w-full gap-4">
				{MOCK_DEPOSIT_DATA.map((deposit) => (
					<DepositCard key={deposit.id} {...deposit} />
				))}
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
				<Table columns={columns} data={mockVaults} />
			</div>
		</div>
	);
}

const mockVaults: DApp[] = [
	{
		name: "Desig Vault",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 11.71,
		chain: "30.555$",
		logo: "/assets/ui-icons/market/desigVault.svg",
	},
	{
		name: "Bucket Protocol",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 5.71,
		chain: "23.555$",
		logo: "/assets/ui-icons/market/bucketProtocol.svg",
	},
	{
		name: "Navi Protocol Vault",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 10.71,
		chain: "12.215$",
		logo: "/assets/ui-icons/market/naviProtocolValut.svg",
	},
	{
		name: "Splash",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 1.44,
		chain: "20.085$",
		logo: "/assets/ui-icons/market/splash.svg",
	},
	{
		name: "Pyth Network",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 9.71,
		chain: "27.715$",
		logo: "/assets/ui-icons/market/pythNetwork.svg",
	},
	{
		name: "Scallop",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 2.71,
		chain: "29.885$",
		logo: "/assets/ui-icons/market/scallop.svg",
	},
	{
		name: "BlueMove",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 2.71,
		chain: "11.235$",
		logo: "/assets/ui-icons/market/blueMove.svg",
	},
	{
		name: "OmniBTC",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 0.56,
		chain: "00.805$",
		logo: "/assets/ui-icons/market/omniBtc.svg",
	},
];

const MOCK_DEPOSIT_DATA: DepositData[] = [
	{
		id: "totalValue",
		title: "Total Value Routed",
		value: "$9.62M",
		tooltip: "",
	},
	{
		id: "totalDeposit",
		title: "Total Deposit",
		value: "$14.72M",
		tooltip: "",
	},
	{
		id: "totalBorrow",
		title: "Total Borrow",
		value: "$9.23M",
		tooltip: "",
	},
];
