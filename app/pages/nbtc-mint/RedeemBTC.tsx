import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../components/form/FormInput";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { useState, useEffect } from "react";
import { FormNumericInput } from "../../components/form/FormNumericInput";
import { BTC, formatNBTC, parseNBTC } from "~/lib/denoms";
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
import { createRedeemTxn } from "./redeemTxn";
import { logError, logger } from "~/lib/log";
import { scriptPubKeyFromAddress } from "~/lib/bitcoin.client";
import type { RedeemRequestEventRaw } from "@gonative-cc/sui-indexer/models";
import { Info } from "lucide-react";
import { makeReq, type QueryNetworkFeesResp } from "~/server/nbtc/jsonrpc";
import { useFetcher } from "react-router";

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
	feeSatoshi: number;
}

interface RedeemBTCProps {
	fetchRedeemTxs: () => void;
	handleRedeemBTCSuccess: (txId: string, e: RedeemRequestEventRaw) => Promise<void>;
}

export function RedeemBTC({ fetchRedeemTxs, handleRedeemBTCSuccess }: RedeemBTCProps) {
	const feeFetcher = useFetcher<QueryNetworkFeesResp>();
	const recommendedMinerFee = feeFetcher?.data;
	const { mutateAsync: signTransaction } = useSignTransaction();
	const [isProcessing, setIsProcessing] = useState(false);
	const { currentAddress, network } = useXverseWallet();
	const { nbtc } = useNetworkVariables();
	const currentAccount = useCurrentAccount();
	const isSuiConnected = !!currentAccount;
	const nbtcBalanceRes = useCoinBalance("NBTC");
	const suiBalanceRes = useCoinBalance("SUI");
	const client = useSuiClient();

	useEffect(() => {
		if (feeFetcher.state === "idle" && !recommendedMinerFee && currentAccount) {
			makeReq(feeFetcher, {
				method: "queryBitcoinFee",
				params: [network, nbtc.setupId],
			});
		}
	}, [currentAccount, feeFetcher, feeFetcher.state, recommendedMinerFee, network, nbtc.setupId]);

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
			feeSatoshi: recommendedMinerFee,
		},
	});

	const { handleSubmit, setValue, watch } = redeemNBTCForm;
	const feeSatoshi = watch("feeSatoshi");
	const isFeeLessThanRecommendedFee =
		recommendedMinerFee !== undefined && feeSatoshi > 0 && feeSatoshi < recommendedMinerFee;

	const maxNBTCAmount = nbtcBalanceStr || "";
	useEffect(() => setValue("bitcoinAddress", currentAddress?.address || ""), [setValue, currentAddress]);
	useEffect(
		() => (recommendedMinerFee ? setValue("feeSatoshi", recommendedMinerFee) : undefined),
		[setValue, recommendedMinerFee],
	);

	const handleRedeemTx = async ({ numberOfNBTC, bitcoinAddress, feeSatoshi }: RedeemNBTCForm) => {
		if (!currentAccount || !nbtcBalanceRes || !nbtcBalanceRes.coinType) return;
		setIsProcessing(true);
		try {
			toast({
				title: "Redeem Initiated",
				description: `Redeeming ${numberOfNBTC} nBTC to ${bitcoinAddress}`,
				variant: "info",
			});
			// validate BTC address
			const recipientScriptBuffer: Uint8Array | null = await scriptPubKeyFromAddress(
				bitcoinAddress,
				network,
			);
			if (!recipientScriptBuffer) throw new Error("Invalid recipient address");
			if (!feeSatoshi) throw new Error("Invalid miner fee");
			// create redeem tx
			const transaction = await createRedeemTxn(
				currentAccount.address,
				parseNBTC(numberOfNBTC),
				BigInt(feeSatoshi),
				recipientScriptBuffer,
				nbtc,
				client,
				nbtcBalanceRes.coinType,
			);
			const result = await signAndExecTx(transaction, client, signTransaction, {
				showEffects: true,
				showBalanceChanges: true,
				showEvents: true,
			});
			logger.info({ msg: "Redeem tx:", method: "handleRedeemTx", digest: result.digest });
			const success = result.effects?.status?.status === "success";
			if (success) {
				if (result.events) {
					const [event] = result.events;
					if (event)
						await handleRedeemBTCSuccess(
							result.digest,
							event.parsedJson as RedeemRequestEventRaw,
						);
					else
						logger.info({
							msg: "Redeem BTC event",
							method: "handleRedeemTx",
							errors: "No redeem BTC event found",
						});
				}
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
							decimalScale={BTC}
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
						<fieldset className="fieldset">
							<p className="flex items-center">
								<legend className="fieldset-legend">Miner fee</legend>
								<span
									className="tooltip ml-2 cursor-help"
									data-tip="Network transaction fee paid to miners for verifying and securing your transfer."
								>
									<Info size={18} />
								</span>
							</p>
							<FormNumericInput
								required
								name="feeSatoshi"
								placeholder="Enter miner fee..."
								className="h-10 sm:h-14"
								decimalScale={0}
								allowNegative={false}
								maxLength={BTC}
								rules={{
									validate: {
										validateMinerFee: async (value: number) => {
											if (value > 0) return true;
											return "Should be greater than 0";
										},
									},
								}}
								rightAdornments={<>nSats</>}
							/>
							{isFeeLessThanRecommendedFee && (
								<div className="alert alert-warning mt-2">
									<p>
										<strong>Low fee detected:</strong> This transaction may face
										significant delays or fail to confirm. We recommend using the
										suggested fee for faster processing.
									</p>
								</div>
							)}
						</fieldset>

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
