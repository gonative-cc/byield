import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../components/form/FormInput";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { useState, useEffect } from "react";
import { FormNumericInput } from "../../components/form/FormNumericInput";
import { formatNBTC, parseNBTC } from "~/lib/denoms";
import { buttonEffectClasses, classNames } from "~/util/tailwind";
import { toast } from "~/hooks/use-toast";
import { useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { handleBalanceChanges, useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { NBTCIcon } from "~/components/icons";
import { Percentage } from "../../components/Percentage";
import { SuiConnectModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { isValidBitcoinAddress } from "~/lib/bitcoin.client";
import { useNetworkVariables } from "~/networkConfig";
import { signAndExecTx } from "~/lib/suienv";
import { createRedeemTxn } from "./mintRedeemTxn";
import { logError, logger } from "~/lib/log";

interface NBTCRightAdornmentProps {
	maxNBTCAmount: string;
	onMaxClick: (val: string) => void;
}

function NBTCRightAdornment({ maxNBTCAmount, onMaxClick }: NBTCRightAdornmentProps) {
	return (
		<div className="flex flex-col items-center gap-2 py-2">
			{maxNBTCAmount && (
				<div className="flex items-center gap-2">
					<p className="text-xs whitespace-nowrap">Balance: {maxNBTCAmount} nBTC</p>
					<button
						type="button"
						onClick={() => onMaxClick(maxNBTCAmount)}
						className="btn btn-primary btn-link h-fit w-fit p-0 pr-2 text-xs"
					>
						Max
					</button>
				</div>
			)}
			<NBTCIcon className="mr-1 flex justify-end" containerClassName="w-full justify-end" />
		</div>
	);
}

interface RedeemNBTCForm {
	numberOfNBTC: string;
	bitcoinAddress: string;
}

interface RedeemBTCProps {
	fetchRedeemTxs: () => void;
}

export function RedeemBTC({ fetchRedeemTxs }: RedeemBTCProps) {
	const { mutateAsync: signTransaction } = useSignTransaction();
	const [isProcessing, setIsProcessing] = useState(false);
	const { currentAddress, network } = useXverseWallet();
	const { redeemBTC } = useNetworkVariables();
	const currentAccount = useCurrentAccount();
	const isSuiConnected = !!currentAccount;
	const nbtcBalanceRes = useCoinBalance("NBTC");
	const suiBalanceRes = useCoinBalance("SUI");
	const client = useSuiClient();
	let nbtcBalance: bigint | null = null;
	let nbtcBalanceStr = "";
	if (nbtcBalanceRes) {
		nbtcBalance = BigInt(nbtcBalanceRes.balance);
		nbtcBalanceStr = formatNBTC(nbtcBalance);
	}

	const redeemNBTCForm = useForm<RedeemNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			numberOfNBTC: "",
			bitcoinAddress: currentAddress?.address || "",
		},
	});

	const { handleSubmit, setValue } = redeemNBTCForm;

	const maxNBTCAmount = nbtcBalanceStr || "";

	useEffect(() => setValue("bitcoinAddress", currentAddress?.address || ""), [setValue, currentAddress]);

	const handleRedeemTx = async ({ numberOfNBTC, bitcoinAddress }: RedeemNBTCForm) => {
		if (!currentAccount || !nbtcBalanceRes || !nbtcBalanceRes.coinType) return;
		setIsProcessing(true);
		try {
			toast({
				title: "Redeem Initiated",
				description: `Redeeming ${numberOfNBTC} nBTC to ${bitcoinAddress}`,
				variant: "info",
			});
			const transaction = await createRedeemTxn(
				currentAccount.address,
				parseNBTC(numberOfNBTC),
				bitcoinAddress,
				redeemBTC,
				client,
				network,
				nbtcBalanceRes.coinType,
			);
			const result = await signAndExecTx(transaction, client, signTransaction, {
				showEffects: true,
				showBalanceChanges: true,
			});
			logger.info({ msg: "Redeem tx:", method: "handleRedeemTx", digest: result.digest });
			const success = result.effects?.status?.status === "success";
			if (success) {
				if (result.balanceChanges) {
					const cachedCoins = [
						// nBTC
						{
							coinType: nbtcBalanceRes.coinType,
							currentBalance: nbtcBalanceRes.balance,
							updateCoinBalanceInCache: nbtcBalanceRes.updateCoinBalanceInCache,
						},
					];
					// SUI
					if (suiBalanceRes?.coinType)
						cachedCoins.push({
							coinType: suiBalanceRes.coinType,
							currentBalance: suiBalanceRes.balance,
							updateCoinBalanceInCache: suiBalanceRes.updateCoinBalanceInCache,
						});
					handleBalanceChanges(result.balanceChanges, cachedCoins);
				}
				toast({
					title: "Redeem nBTC success",
					description: `Redeem ${numberOfNBTC} nBTC to ${bitcoinAddress} successful`,
				});
				fetchRedeemTxs();
			} else {
				logError({ msg: "Redeem nBTC FAILED", method: "handleRedeemTx", errors: result.errors });
				toast({
					title: "Redeem nBTC failed",
					description: `Redeeming ${numberOfNBTC} nBTC to ${bitcoinAddress} failed`,
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Transaction Failed",
				description: error instanceof Error ? error.message : "Unknown error occurred",
				variant: "destructive",
			});
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<FormProvider {...redeemNBTCForm}>
			<form onSubmit={handleSubmit(handleRedeemTx)} className="mx-auto max-w-lg">
				<div className="card">
					<div className="card-body flex flex-col space-y-4">
						<h2 className="text-center text-lg">Redeem nBTC to BTC</h2>
						<FormNumericInput
							required
							name="numberOfNBTC"
							placeholder="Enter number of nBTC"
							className="h-10 sm:h-14"
							inputMode="decimal"
							decimalScale={8}
							allowNegative={false}
							rightAdornments={
								<NBTCRightAdornment
									onMaxClick={(val: string) => setValue("numberOfNBTC", val)}
									maxNBTCAmount={maxNBTCAmount}
								/>
							}
							rules={{
								validate: {
									isSuiConnected: () => isSuiConnected || "Please connect Sui wallet",
									minimumAmount: (value: string) => {
										if (parseNBTC(value) > 0n) {
											return true;
										}
										return "Amount must be greater than 0";
									},
									enoughBalance: (value: string) => {
										if (!nbtcBalanceRes)
											return "Unable to check nBTC balance. Please try again later.";
										if (nbtcBalance !== null) {
											if (parseNBTC(value) <= nbtcBalance) {
												return true;
											}
											return "Not enough nBTC balance";
										}
									},
								},
							}}
						/>
						<Percentage
							onChange={(value: number) => {
								if (nbtcBalance !== null) {
									const val = (nbtcBalance * BigInt(value)) / 100n;
									setValue("numberOfNBTC", formatNBTC(val));
								}
							}}
						/>
						<FormInput
							required
							name="bitcoinAddress"
							placeholder="Enter destination Bitcoin Address..."
							className="h-10 sm:h-14"
							rules={{
								validate: {
									validateBitcoinAddress: async (value: string) => {
										if (await isValidBitcoinAddress(value, network)) {
											return true;
										}
										return "Enter valid Bitcoin address";
									},
								},
							}}
						/>

						{isSuiConnected ? (
							<button
								type="submit"
								disabled={isProcessing}
								className={classNames(
									"btn btn-primary btn-wide",
									buttonEffectClasses(),
									isProcessing ? "loading" : "",
								)}
							>
								{isProcessing ? "Processing..." : "Redeem nBTC"}
							</button>
						) : (
							<SuiConnectModal />
						)}
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
