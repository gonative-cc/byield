import { Card, CardContent } from "./ui/card";
import { BitcoinBalance } from "./BitcoinBalance";
import { Link } from "@remix-run/react";
import { Button } from "./ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "./form/FormInput";

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

function Percentage() {
	return (
		<div className="flex justify-between mb-4 space-x-2">
			{PERCENTAGE.map(({ id, value }) => (
				<Button key={id} variant="outline" className="bg-azure-10 w-full flex-1 flex">
					{value}%
				</Button>
			))}
		</div>
	);
}

interface ExchangeRateProps {
	fee: number;
	youReceive: number;
}

function Fee({ fee, youReceive }: ExchangeRateProps) {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl h-24">
			<CardContent className="flex flex-col justify-between h-full p-0">
				<div className="flex justify-between">
					<p className="text-gray-400">Fixed Fee</p>
					<p>{fee} Satoshi</p>
				</div>
				<div className="flex justify-between">
					<p className="text-gray-400">You Receive</p>
					<p>{youReceive} nBTC</p>
				</div>
			</CardContent>
		</Card>
	);
}

interface MinBTCForm {
	numberOfBTC: number;
	suiAddress: string;
}

interface MintBTCProps {
	availableBalance: number;
	suiAddress: string;
}

export function MintBTC({ availableBalance, suiAddress }: MintBTCProps) {
	const mintBTCForm = useForm<MinBTCForm>({
		defaultValues: {
			// TODO: make it dynamic
			numberOfBTC: 1,
			suiAddress,
		},
	});
	const { handleSubmit, watch } = mintBTCForm;
	const numberOfBTC = watch("numberOfBTC");

	// santoshi. 1BTC = 10^8 satoshi
	const fee = 0.00000001;

	return (
		<FormProvider {...mintBTCForm}>
			<form
				onSubmit={handleSubmit((formData) => {
					// TODO: handle the nbtc form data
					console.log("Depositing with Sui Address:", formData);
				})}
			>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						<BitcoinBalance availableBalance={availableBalance} />
						<FormInput
							required
							name="numberOfBTC"
							type="number"
							placeholder="number"
							rightAdornments={<span className="text-sm font-medium w-20">~$0 USD</span>}
							className="h-16"
						/>
						<Percentage />
						<FormInput
							required
							name="suiAddress"
							type="text"
							placeholder="Enter Your Sui Address..."
							value={suiAddress}
							className="h-16"
						/>
						<Fee fee={10} youReceive={numberOfBTC - fee} />
						<Button type="submit">Deposit BTC and mint nBTC</Button>
						<div className="flex justify-between">
							<span>TX ID: b99d9a361ac9db3...</span>
							<Link
								target="_blank"
								to={"https://v3.tailwindcss.com/docs/font-weight"}
								rel="noreferrer"
							>
								Track confirmation in explorer
							</Link>
						</div>
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
