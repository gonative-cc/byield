import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FormInput } from "./form/FormInput";
import { FormProvider, useForm } from "react-hook-form";
import { useContext } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariables } from "~/networkConfig";
import { suiToMist } from "~/util/util";
import { useToast } from "~/hooks/use-toast";

interface ExchangeRateProps {
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
}

export function BuynBTC() {
	const { toast } = useToast();
	const { connectedWallet } = useContext(WalletContext);
	const client = useSuiClient();
	const { packageId, module, swapFunction, vaultId, pricePerNBTCInSUI } = useNetworkVariables();
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
		execute: async ({ bytes, signature }) =>
			await client.executeTransactionBlock({
				transactionBlock: bytes,
				signature,
				options: {
					// Raw effects are required so the effects can be reported back to the wallet
					showRawEffects: true,
					// Select additional data to return
					showObjectChanges: true,
				},
			}),
	});

	const otcBuyForm = useForm<OtcBuyForm>();
	const { watch } = otcBuyForm;
	const numberOfSuiCoins = watch("numberOfSuiCoins");
	const amountOfnBTC = numberOfSuiCoins / pricePerNBTCInSUI;

	return (
		<FormProvider {...otcBuyForm}>
			<form
				onSubmit={otcBuyForm.handleSubmit(async (data) => {
					// Convert SUI to MIST
					const suiAmountMist = suiToMist(data.numberOfSuiCoins);
					const tx = new Transaction();
					const [coins] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmountMist)]);
					// Call the swap_sui_for_nbtc function
					tx.moveCall({
						target: `${packageId}::${module}::${swapFunction}`,
						arguments: [
							tx.object(vaultId), // Vault object
							coins, // Coin<SUI> argument
						],
					});
					signAndExecuteTransaction(
						{
							transaction: tx,
						},
						{
							onSuccess: () => {
								toast({
									title: "Buy nBTC",
									description: `Transaction succeeded`,
								});
							},
							onError: (error) => {
								toast({
									title: "Buy nBTC",
									description: `Transaction failed: ${error.message}`,
									variant: "destructive",
								});
							},
						},
					);
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
						/>
						{numberOfSuiCoins && <Fee youReceive={amountOfnBTC} />}
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
