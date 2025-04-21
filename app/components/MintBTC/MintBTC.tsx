import { useCallback } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { BitcoinBalance } from "../BitcoinBalance/BitcoinBalance";
import { Link } from "@remix-run/react";
import { Button } from "../ui/button";

const PERCENTAGE = [
	{
		id: "percentage-1",
		value: 25,
	},
	{
		id: "percentage-2",
		value: 50,
	},
	{
		id: "percentage-3",
		value: 75,
	},
	{
		id: "percentage-4",
		value: 100,
	},
];

const Percentage = () => (
	<div className="flex justify-between mb-4 space-x-2">
		{PERCENTAGE.map(({ id, value }) => (
			<Button key={id} variant="outline" className="bg-azure-10 w-full flex-1 flex">
				{value}%
			</Button>
		))}
	</div>
);

const FundingOptions = () => (
	<Select>
		<SelectTrigger className="w-full mb-4 bg-gray-800">
			<SelectValue placeholder="Funding Options" />
		</SelectTrigger>
		<SelectContent>
			<SelectItem value="option1">Funding Options</SelectItem>
		</SelectContent>
	</Select>
);

interface ExchangeRateProps {
	fee: string;
	youReceive: number;
}

const Fee = ({ fee, youReceive }: ExchangeRateProps) => (
	<Card className="p-4 bg-azure-10 rounded-2xl h-24">
		<CardContent className="flex flex-col justify-between h-full p-0">
			<div className="flex justify-between">
				<p className="text-gray-400">Exchange Rate</p>
				<p>{fee}</p>
			</div>
			<div className="flex justify-between">
				<p className="text-gray-400">You Receive</p>
				<p>{youReceive} nBTC</p>
			</div>
		</CardContent>
	</Card>
);

interface MintBTCProps {
	availableBalance: number;
	suiAddress: string;
}

export const MintBTC = ({ availableBalance, suiAddress }: MintBTCProps) => {
	const handleDeposit = useCallback(() => {
		// Handle deposit logic here
		console.log("Depositing with Sui Address:", suiAddress);
	}, [suiAddress]);

	// TODO: make it dynamic
	const input = 1;
	// santoshi. 1BTC = 10^8 satoshi
	const fee = 0.00000001;

	return (
		<Card>
			<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
				<BitcoinBalance availableBalance={availableBalance} />
				<Input
					type="number"
					placeholder="number"
					value={input}
					rightAdornments={<span className="text-sm font-medium w-20">~$0 USD</span>}
				/>
				<Percentage />
				<Input type="text" placeholder="Enter Your Sui Address..." value={suiAddress} />
				<FundingOptions />
				<Fee fee={"1 BTC → 0.99 nBTC"} youReceive={input - fee} />
				<Button onClick={handleDeposit}>Deposit BTC and mint nBTC</Button>
				<div className="flex justify-between">
					<span>TX ID: b99d9a361ac9db3...</span>
					<Link target="_blank" to={"https://v3.tailwindcss.com/docs/font-weight"} rel="noreferrer">
						Track confirmation in explorer
					</Link>
				</div>
			</CardContent>
		</Card>
	);
};
