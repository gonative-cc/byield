import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FormInput } from "./form/FormInput";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useCallback } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariables } from "~/networkConfig";
import { suiToMist } from "~/util/util";
import { useToast } from "~/hooks/use-toast";
import { pricePerNBTCInSUI } from "~/constant";

const BUY_NBTC_INSTRUCTIONS = [
	"Click on Connect Sui Wallet button, if not already connected.",
	"Use the Slush wallet.",
	`Click "profile" → network → make sure you select testnet.`,
	`Click "profile" → scroll down to the "About" section → click "Request Sui Token".`,
];

function Instructions() {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl">
			<CardContent className="flex flex-col justify-between p-0">
				<h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Instructions:</h2>
				<ul className="max-w-md space-y-1 text-gray-500 list-disc">
					{BUY_NBTC_INSTRUCTIONS.map((instruction) => (
						<li key={instruction} className="flex items-start">
							<span className="mr-2">•</span>
							<span>{instruction}</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

interface FeeProps {
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
	suiAmount: number;
}

export function BuyNBTC() {
	const { toast } = useToast();
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const client = useSuiClient();
	const { nbtcOTC } = useNetworkVariables();
	const { packageId, module, swapFunction, vaultId } = nbtcOTC;
	const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
		execute: async ({ bytes, signature }) =>
			await client.executeTransactionBlock({
				transactionBlock: bytes,
				signature,
				options: {
					showRawEffects: true,
					showObjectChanges: true,
				},
			}),
	});

	const buyNBTCForm = useForm<BuyNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
	});
	const { watch } = buyNBTCForm;
	const suiAmount = watch("suiAmount");
	const amountOfNBTC = suiAmount / pricePerNBTCInSUI;
	const isAmountOfNBTCValid = amountOfNBTC > 0;

	const handleTransaction = useCallback(
		({ suiAmount }: BuyNBTCForm) => {
			const suiAmountMist = suiToMist(suiAmount);
			const transaction = new Transaction();
			const [coins] = transaction.splitCoins(transaction.gas, [transaction.pure.u64(suiAmountMist)]);
			transaction.moveCall({
				target: `${packageId}::${module}::${swapFunction}`,
				arguments: [
					transaction.object(vaultId), // Vault object
					coins, // Coin<SUI> argument
				],
			});

			signAndExecuteTransaction(
				{
					transaction,
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
		},
		[module, packageId, signAndExecuteTransaction, swapFunction, toast, vaultId],
	);

	return (
		<FormProvider {...buyNBTCForm}>
			<form onSubmit={buyNBTCForm.handleSubmit(handleTransaction)} className="w-1/2">
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						<FormInput
							required
							name="suiAmount"
							type="number"
							placeholder="Enter SUI amount"
							className="h-16"
							rules={{
								validate: {
									positive: (value: string) =>
										Number(value) > 0 || "SUI amount must be greater than 0",
								},
							}}
						/>
						{isAmountOfNBTCValid && <Fee youReceive={amountOfNBTC} />}
						{isAmountOfNBTCValid && (
							<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
								This is a fixed price buy. The price is 25,000 SUI / BTC.
							</span>
						)}
						<Instructions />
						{isSuiWalletConnected ? <Button type="submit">Buy</Button> : <SuiModal />}
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
