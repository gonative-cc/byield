import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FormInput } from "./form/FormInput";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useEffect } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface ExchangeRateProps {
	fee: number;
	youReceive: number;
}

function Fee({ youReceive }: ExchangeRateProps) {
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

interface OtcBuyForm {
	numberOfSuiCoins: number;
	suiAddress?: string;
}

export function OtcBuy() {
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const account = useCurrentAccount();

	// TODO: get the current nBTC price
	const nBTCPrice = 1.2;
	const otcBuyForm = useForm<OtcBuyForm>();
	const { watch, setValue } = otcBuyForm;
	const numberOfSuiCoins = watch("numberOfSuiCoins");
	const amountOfnBTC = numberOfSuiCoins / nBTCPrice;

	useEffect(() => {
		if (isSuiWalletConnected) setValue("suiAddress", account?.address);
	}, [account?.address, isSuiWalletConnected, setValue]);

	return (
		<FormProvider {...otcBuyForm}>
			<form
				onSubmit={otcBuyForm.handleSubmit((data) => {
					console.log("handle otc form data", data);
				})}
				className="w-1/2"
			>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						<FormInput
							required
							type="number"
							placeholder="Enter number of sui coins"
							className="h-16"
							name="numberOfSuiCoins"
							label=""
						/>
						<FormInput
							required
							name="suiAddress"
							placeholder="Enter Your Sui Address..."
							className="h-16"
							label=""
						/>
						<Fee fee={10} youReceive={amountOfnBTC} />
						{isSuiWalletConnected ? <Button type="submit">Buy</Button> : <SuiModal />}
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
