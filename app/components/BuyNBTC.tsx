import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useCallback, useEffect, useMemo } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariables } from "~/networkConfig";
import { createBuyNBTCTxn, mistToSui, suiToMist } from "~/util/util";
import { BUFFER_BALANCE, PRICE_PER_NBTC_IN_SUI } from "~/constant";
import { Link } from "@remix-run/react";
import { ArrowDown, Check, CircleX } from "lucide-react";
import { useSuiBalance } from "./Wallet/SuiWallet/useSuiBalance";
import { FormNumericInput } from "./form/FormNumericInput";
import { classNames } from "~/lib/utils";
import { Modal } from "./ui/dialog";
import { NumericFormat } from "react-number-format";

interface FeeProps {
	fee: number;
}

interface BuyNBTCForm {
	suiAmount: string;
	amountOfNBTC: string;
	transaction: Transaction | null;
	fee?: number;
}

function Fee({ fee }: FeeProps) {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl h-14">
			<CardContent className="flex flex-col justify-between h-full p-0">
				<div className="flex justify-between">
					<p className="text-gray-400 text-sm">Estimated Gas Fee</p>
					<NumericFormat
						displayType="text"
						value={fee}
						suffix=" SUI"
						allowNegative={false}
						className="text-sm"
					/>
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
							<li>
								<Link
									target="_blank"
									to={`https://faucet.sui.io/?network=testnet&address=${account?.address}`}
									rel="noreferrer"
								>
									<Button type="button" variant="link" className="p-0">
										Request Sui Tokens from faucet.
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

export function BuyNBTC() {
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const client = useSuiClient();
	const account = useCurrentAccount();
	const { nbtcOTC } = useNetworkVariables();
	const { balance, refetchBalance } = useSuiBalance();
	const { packageId, module, swapFunction, vaultId } = nbtcOTC;
	const {
		mutate: signAndExecuteTransaction,
		reset: resetMutation,
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
	});
	const { watch, trigger, setValue, handleSubmit, reset } = buyNBTCForm;
	const suiAmount = watch("suiAmount");
	const transaction = watch("transaction");
	const fee = watch("fee");

	const suiAmountMist = useMemo(() => suiToMist(BigNumber(suiAmount)), [suiAmount]);

	useEffect(() => {
		if (account && suiAmount) {
			const txn = createBuyNBTCTxn(account?.address, suiAmountMist, nbtcOTC);
			setValue("transaction", txn);
		}
	}, [account, module, nbtcOTC, packageId, setValue, suiAmount, suiAmountMist, swapFunction, vaultId]);

	useEffect(() => {
		async function getFee() {
			if (transaction && suiAmount && balance?.totalBalance) {
				const transactionBytes = await transaction.build({ client: client });
				const dryRunResult = await client.dryRunTransactionBlock({
					transactionBlock: transactionBytes,
				});
				if (dryRunResult?.effects?.gasUsed) {
					const { computationCost, storageCost, storageRebate } = dryRunResult.effects.gasUsed;
					const totalGasFee = BigNumber(computationCost).plus(storageCost).minus(storageRebate);
					let totalFee = totalGasFee.toNumber();
					// keep buffer balance in case user try to use all max balance
					const isThereBufferBalanceAvailable = BigNumber(balance?.totalBalance)
						.minus(suiAmountMist)
						.isGreaterThanOrEqualTo(BUFFER_BALANCE);
					if (!isThereBufferBalanceAvailable) {
						totalFee += BUFFER_BALANCE;
					}
					setValue("fee", totalFee);
					trigger("suiAmount");
				}
			}
		}
		getFee();
	}, [balance, client, setValue, suiAmount, suiAmountMist, transaction, trigger]);

	const handleTransaction = useCallback(async () => {
		const suiAmountMistAfterFee = BigNumber(suiAmountMist).minus(BigNumber(fee ?? 0));
		if (!account) {
			console.error("Account is not available. Cannot proceed with the transaction.");
			return;
		}
		const txn = createBuyNBTCTxn(account.address, suiAmountMistAfterFee, nbtcOTC);
		signAndExecuteTransaction(
			{
				transaction: txn,
			},
			{
				onSettled: () => refetchBalance(),
			},
		);
	}, [account, fee, nbtcOTC, refetchBalance, signAndExecuteTransaction, suiAmountMist]);

	const renderFormFooter = () =>
		isSuiWalletConnected ? (
			<Button type="submit" disabled={isPending} isLoading={isPending}>
				Buy
			</Button>
		) : (
			<SuiModal />
		);

	const resetForm = useCallback(() => {
		resetMutation();
		reset({
			suiAmount: "",
			amountOfNBTC: "",
			fee: undefined,
			transaction: null,
		});
	}, [reset, resetMutation]);

	const youReceive = useMemo(
		() =>
			BigNumber(suiAmount)
				.minus(mistToSui(BigNumber(fee ?? 0)))
				.dividedBy(PRICE_PER_NBTC_IN_SUI),
		[fee, suiAmount],
	);

	useEffect(() => {
		if (suiAmount) {
			trigger("suiAmount");
		}
	}, [isSuiWalletConnected, suiAmount, trigger]);

	return (
		<FormProvider {...buyNBTCForm}>
			<form onSubmit={handleSubmit(handleTransaction)} className="flex flex-col gap-4 items-center">
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
									isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
									balance: (value: string) =>
										(balance?.totalBalance &&
											BigNumber(value).isLessThanOrEqualTo(
												mistToSui(BigNumber(balance?.totalBalance)),
											)) ||
										"Not enough balance available",
									smallAmount: () => {
										if (!isSuiWalletConnected || youReceive.isGreaterThan(0)) return true;
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
								value={youReceive.isGreaterThan(0) ? youReceive.toNumber() : "0.0"}
								allowNegative={false}
								placeholder={youReceive.isLessThanOrEqualTo(0) && isSuiWalletConnected ? "0.0" : ""}
								readOnly
								rightAdornments={
									<div className="flex gap-2 items-center mr-2">
										nBTC
										<img src="/nbtc.svg" alt="Bitcoin" className="w-7 h-7 mr-2" />
									</div>
								}
							/>
							<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
								This is a fixed price buy. The price is 25,000 SUI / nBTC.
							</span>
						</div>
						{isSuiWalletConnected && <Fee fee={mistToSui(BigNumber(fee ?? 0)).toNumber()} />}
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
