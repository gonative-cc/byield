import { Card, CardContent } from "./ui/card";
import { BitcoinBalance } from "./BitcoinBalance";
import { Link } from "@remix-run/react";
import { Button } from "./ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "./form/FormInput";
import { useXverseWallet } from "./Wallet/XverseWallet/useWallet";
import { useContext } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { FormNumericInput } from "./form/FormNumericInput";
import { NumericFormat } from "react-number-format";
import { formatBTC, parseBTC } from "~/lib/denoms";
import { nBTCMintFeeInSatoshi } from "~/constant";

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

function Percentage({ onChange }: { onChange: (value: number) => void }) {
	return (
		<div className="flex justify-between mb-4 space-x-2">
			{PERCENTAGES.map(({ id, value }) => (
				<Button
					type="button"
					key={id}
					onClick={() => onChange(value)}
					variant="outline"
					className="bg-azure-10 w-full flex-1 flex"
				>
					{value}%
				</Button>
			))}
		</div>
	);
}

interface FeeProps {
	feeInSatoshi: bigint;
	youReceive: string;
}

function Fee({ feeInSatoshi, youReceive }: FeeProps) {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl h-24">
			<CardContent className="flex flex-col justify-between h-full p-0">
				<div className="flex justify-between">
					<p className="text-gray-400">Fixed Fee</p>
					<NumericFormat displayType="text" value={formatBTC(feeInSatoshi)} suffix=" Satoshi" />
				</div>
				<div className="flex justify-between">
					<p className="text-gray-400">You Receive</p>
					<NumericFormat displayType="text" value={youReceive} suffix=" nBTC" />
				</div>
			</CardContent>
		</Card>
	);
}

interface MintNBTCForm {
	numberOfBTC: string;
	suiAddress: string;
}

export function MintBTC() {
	const { balance: walletBalance } = useXverseWallet();
	const { connectedWallet } = useContext(WalletContext);
	const isBitCoinWalletConnected = connectedWallet === ByieldWallet.Xverse;
	const balance = parseBTC(walletBalance ?? "0");
	const mintNBTCForm = useForm<MintNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			numberOfBTC: "",
			suiAddress: "",
		},
	});

	const { handleSubmit, watch, setValue } = mintNBTCForm;
	const numberOfBTC = watch("numberOfBTC");

	const youReceive = parseBTC(numberOfBTC || "0") - nBTCMintFeeInSatoshi;

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
						{isBitCoinWalletConnected && walletBalance && (
							<BitcoinBalance availableBalance={walletBalance} />
						)}
						<FormNumericInput
							required
							name="numberOfBTC"
							placeholder="Enter number of BTC"
							rightAdornments={<span className="text-sm font-medium w-20">~$0 USD</span>}
							className="h-16"
							rules={{
								validate: {
									isWalletConnected: () =>
										isBitCoinWalletConnected || "Please connect Bitcoin wallet",
									balance: (value: string) =>
										parseBTC(value) <= balance || "Not enough balance available",
								},
							}}
						/>
						<Percentage
							onChange={(value: number) => {
								const val = (balance * BigInt(value)) / BigInt(100);
								setValue("numberOfBTC", formatBTC(val));
							}}
						/>
						<FormInput
							required
							name="suiAddress"
							placeholder="Enter destination Sui Address..."
							className="h-16"
						/>
						{youReceive && (
							<Fee feeInSatoshi={nBTCMintFeeInSatoshi} youReceive={formatBTC(youReceive)} />
						)}
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
