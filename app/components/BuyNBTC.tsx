import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FormInput } from "./form/FormInput";
import { FormProvider, useForm } from "react-hook-form";
import { useContext } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";

interface FeeProps {
	fee: number;
	youReceive: number;
}

function Fee({ youReceive }: FeeProps) {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl h-14">
			<CardContent className="flex flex-col justify-between p-0">
				<div className="flex justify-between gap-2">
					<p className="text-gray-400">You Receive</p>
					<p>{youReceive} nBTC</p>
				</div>
			</CardContent>
		</Card>
	);
}

interface BuyNBTCForm {
	numberOfSuiCoins: string;
}

export function BuyNBTC() {
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;

	// TODO: get the current nBTC price
	const NBTCPrice = 1.2;
	const buyNBTCForm = useForm<BuyNBTCForm>();
	const { watch } = buyNBTCForm;
	const numberOfSuiCoins = watch("numberOfSuiCoins");
	const amountOfnBTC = Number(numberOfSuiCoins) / NBTCPrice;

	return (
		<FormProvider {...buyNBTCForm}>
			<form
				onSubmit={buyNBTCForm.handleSubmit((data) => {
					console.log("handle NBTC form data", data);
				})}
				className="w-1/2"
			>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						<FormInput
							required
							placeholder="Enter number of sui coins"
							className="h-16"
							name="numberOfSuiCoins"
						/>
						{numberOfSuiCoins && <Fee fee={10} youReceive={amountOfnBTC} />}
						{numberOfSuiCoins && (
							<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
								This is a fixed price buy. The price is 25,000 SUI / BTC.
							</span>
						)}
						{isSuiWalletConnected ? <Button type="submit">Buy</Button> : <SuiModal />}
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
