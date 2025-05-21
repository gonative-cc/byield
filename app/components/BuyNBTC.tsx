import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useCallback, useState, useEffect } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariables } from "~/networkConfig";
import { mistToSui, suiToMist } from "~/util/util";
import { BUFFER_BALANCE, pricePerNBTCInSUI } from "~/constant";
import { Link } from "@remix-run/react";
import { ArrowDown, Check, CircleX } from "lucide-react";
import { useSuiBalance } from "./Wallet/SuiWallet/useSuiBalance";
import { FormNumericInput } from "./form/FormNumericInput";
import { classNames } from "~/lib/utils";
import { Modal } from "./ui/dialog";
import { NumericFormat } from "react-number-format";

interface FeeProps {
	fee: number;
	youReceive: number;
}

function Fee({ fee, youReceive }: FeeProps) {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl h-20">
			<CardContent className="flex flex-col justify-between h-full p-0">
				<div className="flex justify-between">
					<p className="text-gray-400 text-sm">Estimate Fee</p>
					<NumericFormat
						displayType="text"
						value={fee}
						suffix=" SUI"
						allowNegative={false}
						className="text-sm"
					/>
				</div>
				<div className="flex justify-between">
					<p className="text-gray-400 text-sm">You Receive</p>
					{youReceive > 0 ? (
						<NumericFormat
							displayType="text"
							value={youReceive}
							suffix=" nBTC"
							className="text-sm"
							allowNegative={false}
						/>
					) : (
						<span className="italic text-sm text-red-500">Check SUI amount</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function Instructions() {
	const account = useCurrentAccount();
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
								<Link
									target="_blank"
									to={`https://faucet.sui.io/?network=testnet&address=${account?.address}`}
									rel="noreferrer"
								>
									<Button type="button" variant="link" className="p-0">
										Request Sui Token.
									</Button>
								</Link>
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
	isSuccess: boolean;
	txnId?: string;
	handleRetry: () => void;
}

function TransactionStatus({ isSuccess, txnId, handleRetry }: TransactionStatusProps) {
	const Icon = isSuccess ? Check : CircleX;

	return (
		<div className="p-4 rounded-lg text-white flex flex-col gap-4">
			<div className="flex flex-col items-center gap-2">
				<Icon
					className={classNames({
						"text-green-500": isSuccess,
						"text-red-500": !isSuccess,
					})}
					size={30}
				/>{" "}
				{isSuccess ? "Success" : "Failed"}
			</div>
			<div className="flex flex-col gap-2 items-center">
				{isSuccess && (
					<div className="max-w-md mx-auto p-4 text-center">
						<p className="text-sm leading-relaxed">
							If you want to increase your chances to be whitelisted for BTCFi Beelievers NFT, please
							fill this{" "}
							<Link
								target="_blank"
								to="https://forms.gle/Hu4WUSfgQkp1xsyNA"
								rel="noreferrer"
								className="text-primary underline"
							>
								form.
							</Link>
						</p>
					</div>
				)}
				{txnId && (
					<Link
						target="_blank"
						to={`https://suiscan.xyz/testnet/tx/${txnId}`}
						rel="noreferrer"
						className="m-0 p-0 justify-center flex w-full text-primary max-w-fit text-sm"
					>
						Check Transaction Details
					</Link>
				)}
			</div>
			<Button onClick={handleRetry}>{isSuccess ? "Ok" : "Retry"}</Button>
		</div>
	);
}

interface BuyNBTCForm {
	suiAmount: string | null;
	amountOfNBTC: string;
}

export function BuyNBTC() {
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const client = useSuiClient();
	const account = useCurrentAccount();
	const [transaction, setTransaction] = useState<Transaction | undefined>(undefined);
	const [fee, setFee] = useState<number | undefined>(undefined);
	const { nbtcOTC } = useNetworkVariables();
	const { balance, refetchBalance } = useSuiBalance();
	const { packageId, module, swapFunction, vaultId } = nbtcOTC;
	const {
		mutate: signAndExecuteTransaction,
		reset: signAndExecuteTransactionReset,
		isPending,
		isSuccess,
		isError,
		data,
	} = useSignAndExecuteTransaction({
		execute: async ({ bytes, signature }) =>
			await client.executeTransactionBlock({
				transactionBlock: bytes,
				signature,
				options: {
					showObjectChanges: true,
					showEffects: true,
					showRawEffects: true,
				},
			}),
	});

	const buyNBTCForm = useForm<BuyNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
		defaultValues: {
			suiAmount: null,
		},
	});
	const { watch, trigger } = buyNBTCForm;
	const suiAmount = watch("suiAmount");
	const amountOfNBTC = Number(suiAmount) / pricePerNBTCInSUI || 0;

	useEffect(() => {
		if (!account || !suiAmount) return;
		const suiAmountMist = suiToMist(Number(suiAmount));
		const txn = new Transaction();
		txn.setSender(account?.address);
		const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(suiAmountMist)]);
		txn.moveCall({
			target: `${packageId}::${module}::${swapFunction}`,
			arguments: [txn.object(vaultId), coins],
		});
		setTransaction(() => txn);
	}, [account, module, packageId, suiAmount, swapFunction, vaultId]);

	useEffect(() => {
		async function getFee() {
			if (!transaction) return;
			const transactionBytes = await transaction.build({ client: client });
			const dryRunResult = await client.dryRunTransactionBlock({
				transactionBlock: transactionBytes,
			});
			if (dryRunResult?.effects?.gasUsed) {
				const { computationCost, storageCost, storageRebate } = dryRunResult.effects.gasUsed;
				const totalGasFee = Number(computationCost) + Number(storageCost) - Number(storageRebate);
				const suiAmountMist = suiToMist(Number(suiAmount));
				let totalFee = totalGasFee;
				// keep buffer balance in case user try to use all max balance
				const isThereBufferBalanceAvailable =
					Number(balance?.totalBalance) - Number(suiAmountMist) >= BUFFER_BALANCE;
				if (!isThereBufferBalanceAvailable) {
					totalFee = totalFee + BUFFER_BALANCE;
				}
				setFee(() => totalFee);
				trigger("suiAmount");
			}
		}
		getFee();
	}, [balance?.totalBalance, client, suiAmount, transaction, trigger]);

	const handleTransaction = useCallback(async () => {
		const suiAmountMist = suiToMist(Number(suiAmount));
		const suiAmountMistAfterFee = Number(suiAmountMist) - Number(fee);

		const txn = new Transaction();
		const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(suiAmountMistAfterFee)]);

		txn.moveCall({
			target: `${packageId}::${module}::${swapFunction}`,
			arguments: [
				txn.object(vaultId), // Vault object
				coins, // Coin<SUI> argument
			],
		});

		signAndExecuteTransaction(
			{
				transaction: txn,
			},
			{
				onSettled: () => refetchBalance(),
			},
		);
	}, [fee, module, packageId, refetchBalance, signAndExecuteTransaction, suiAmount, swapFunction, vaultId]);

	const renderFormFooter = () =>
		isSuiWalletConnected ? (
			<Button type="submit" disabled={isPending} isLoading={isPending}>
				Buy
			</Button>
		) : (
			<SuiModal />
		);

	const resetForm = useCallback(() => {
		buyNBTCForm.reset(
			{
				suiAmount: "0",
				amountOfNBTC: "0",
			},
			{
				keepErrors: false, // Clear validation errors
				keepDirty: false, // Reset dirty state
				keepTouched: false, // Reset touched state
			},
		);
		signAndExecuteTransactionReset();
	}, [buyNBTCForm, signAndExecuteTransactionReset]);

	const youReceive = (Number(suiAmount) - Number(mistToSui(Number(fee)))) / pricePerNBTCInSUI;

	return (
		<FormProvider {...buyNBTCForm}>
			<form
				onSubmit={buyNBTCForm.handleSubmit(handleTransaction)}
				className="flex flex-col gap-4 items-center"
			>
				<span className="text-3xl font-semibold text-primary">Buy nBTC</span>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						<Instructions />
						<FormNumericInput
							required
							name="suiAmount"
							placeholder="Enter SUI amount"
							className="h-16"
							inputMode="decimal"
							allowNegative={false}
							decimalScale={6}
							createEmptySpace
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
									balance: (value: string) =>
										Number(value) <= mistToSui(Number(balance?.totalBalance)) ||
										"Not enough balance available",
									smallAmount: () => {
										if (!isSuiWalletConnected || youReceive > 0) return true;
										return "Small SUI amount";
									},
								},
							}}
						/>
						<ArrowDown className="text-primary justify-center w-full flex mb-2 p-0 m-0" />
						<div className="flex flex-col gap-2">
							<FormNumericInput
								name="amountOfNBTC"
								className="h-16"
								value={amountOfNBTC}
								readOnly
								rightAdornments={
									<div className="flex gap-2 items-center mr-2">
										nBTC
										<img src="/nbtc.svg" alt="Bitcoin" className="w-7 h-7 mr-2" />
									</div>
								}
							/>
							<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
								This is a fixed price buy. The price is 25,000 SUI / BTC.
							</span>
						</div>
						{isSuiWalletConnected && <Fee fee={mistToSui(Number(fee))} youReceive={youReceive} />}
						{renderFormFooter()}
					</CardContent>
				</Card>
			</form>
			{(isSuccess || isError) && (
				<Modal title={"Buy nBTC Transaction Status"} open handleClose={resetForm}>
					<TransactionStatus
						isSuccess={data?.effects?.status?.status === "success"}
						handleRetry={resetForm}
						txnId={data?.digest}
					/>
				</Modal>
			)}
		</FormProvider>
	);
}
