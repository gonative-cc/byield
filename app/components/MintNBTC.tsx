import { Card, CardContent } from "./ui/card";
import { BitcoinBalance } from "./BitcoinBalance";
import { Link } from "@remix-run/react";
import { Button } from "./ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "./form/FormInput";

const PERCENTAGES = [
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
			{PERCENTAGES.map(({ id, value }) => (
				<Button key={id} variant="outline" className="bg-azure-10 w-full flex-1 flex">
					{value}%
				</Button>
			))}
		</div>
	);
}

interface FeeProps {
	fee: number;
	youReceive: number;
}

function Fee({ fee, youReceive }: FeeProps) {
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

interface MintNBTCForm {
	numberOfNBTC: string;
	suiAddress: string;
}

interface MintNBTCProps {
	availableBalance: number;
	suiAddress: string;
}

export function MintBTC({ availableBalance, suiAddress }: MintNBTCProps) {
	const mintNBTCForm = useForm<MintNBTCForm>({
		defaultValues: {
			suiAddress,
		},
	});
	const { handleSubmit, watch } = mintNBTCForm;
	const numberOfBTC = watch("numberOfNBTC");

	// satoshi. 1BTC = 10^8 satoshi
	const fee = 0.00000001;

	return (
		<FormProvider {...mintNBTCForm}>
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
							name="numberOfNBTC"
							placeholder="number"
							rightAdornments={<span className="text-sm font-medium w-20">~$0 USD</span>}
							className="h-16"
						/>
						<Percentage />
						<FormInput
							required
							name="suiAddress"
							placeholder="Enter destination Sui Address..."
							value={suiAddress}
							className="h-16"
						/>
						<Fee fee={10} youReceive={Number(numberOfBTC) - fee} />
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
