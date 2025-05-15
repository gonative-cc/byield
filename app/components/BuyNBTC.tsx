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
import { mistToSui, suiToMist } from "~/util/util";
import { pricePerNBTCInSUI } from "~/constant";
import { Link } from "@remix-run/react";
import { ArrowDown } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { useSuiBalance } from "./Wallet/SuiWallet/useSuiBalance";

function Instructions() {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl">
			<CardContent className="flex flex-col justify-between p-0">
				<h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Instructions:</h2>
				<ul className="space-y-2 text-gray-500 list-disc list-inside dark:text-gray-400">
					<li>Click on Connect Sui Wallet button, if not already connected.</li>
					<li>Use the Slush wallet.</li>
					<li>
						Make sure you have testnet Sui tokens:
						<ul className="ps-8 mt-2 space-y-1 list-disc list-outside">
							<li>Click {`"profile"`} → network → make sure you select testnet.</li>
							<li>
								Click {`"profile"`} → scroll down to the {`"About"`} section → click{" "}
								{`"Request Sui Token"`}.
							</li>
							<li>
								You can also check{" "}
								<Link
									target="_blank"
									to="https://docs.sui.io/guides/developer/getting-started/get-coins"
									rel="noreferrer"
								>
									<Button type="button" variant="link" className="p-0">
										alternative faucets.
									</Button>
								</Link>
							</li>
						</ul>
					</li>
				</ul>
			</CardContent>
		</Card>
	);
}

interface TransactionStatusProps {
	isSuccess?: boolean;
	handleRetry: () => void;
}

function TransactionStatus({ isSuccess, handleRetry }: TransactionStatusProps) {
	return (
		<Card>
			<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
				Transaction: {isSuccess ? "Success" : "Failed"}
				<Button onClick={handleRetry}>Retry</Button>
			</CardContent>
		</Card>
	);
}

interface BuyNBTCForm {
	suiAmount: string;
	amountOfNBTC: string;
}

export function BuyNBTC() {
	const { toast } = useToast();
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const client = useSuiClient();
	const { nbtcOTC } = useNetworkVariables();
	const balance = useSuiBalance();
	const { packageId, module, swapFunction, vaultId } = nbtcOTC;
	const {
		mutate: signAndExecuteTransaction,
		reset: signAndExecuteTransactionReset,
		isPending,
		isSuccess,
		isError,
	} = useSignAndExecuteTransaction({
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
	const amountOfNBTC = (Number(suiAmount) / pricePerNBTCInSUI || 0).toFixed(10);

	const handleTransaction = useCallback(
		({ suiAmount }: BuyNBTCForm) => {
			const suiAmountMist = suiToMist(Number(suiAmount));
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
					onSettled: () => buyNBTCForm.reset(),
				},
			);
		},
		[buyNBTCForm, module, packageId, signAndExecuteTransaction, swapFunction, toast, vaultId],
	);

	if (isSuccess || isError) {
		return (
			<TransactionStatus
				isSuccess={isSuccess}
				handleRetry={() => {
					buyNBTCForm.reset();
					signAndExecuteTransactionReset();
				}}
			/>
		);
	}

	return (
		<FormProvider {...buyNBTCForm}>
			<form onSubmit={buyNBTCForm.handleSubmit(handleTransaction)}>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						<FormInput
							required
							name="suiAmount"
							placeholder="Enter SUI amount"
							className="h-16"
							inputMode="decimal"
							rightAdornments={
								<div className="flex gap-2 items-center mr-2">
									SUI
									<img
										src="https://cdn.prod.website-files.com/6425f546844727ce5fb9e5ab/65690e5e73e9e2a416e3502f_sui-mark.svg"
										loading="lazy"
										alt="SUI"
										className="w-7 h-7"
									/>
								</div>
							}
							rules={{
								validate: {
									positive: (value: string) =>
										Number(value) > 0 || "SUI amount must be greater than 0",
									balance: (value: string) =>
										Number(value) <= mistToSui(Number(balance?.totalBalance)) ||
										"Not enough balance available",
								},
							}}
						/>
						<ArrowDown className="text-primary justify-center w-full flex" />
						<FormInput
							disabled
							name="amountOfNBTC"
							className="h-16"
							value={amountOfNBTC}
							rightAdornments={
								<div className="flex gap-2 items-center mr-2">
									nBTC
									<img src="/nbtc.svg" alt="Bitcoin" className="w-7 h-7" />
								</div>
							}
						/>
						<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
							This is a fixed price buy. The price is 25,000 SUI / BTC.
						</span>
						<Instructions />
						{isSuiWalletConnected ? (
							<Button type="submit" disabled={isPending} isLoading={isPending}>
								Buy
							</Button>
						) : (
							<SuiModal />
						)}
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
