import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../components/form/FormInput";
import { useXverseWallet } from "../../components/Wallet/XverseWallet/useWallet";
import { useState } from "react";
import { FormNumericInput } from "../../components/form/FormNumericInput";
import { formatNBTC, parseNBTC } from "~/lib/denoms";
import { buttonEffectClasses, classNames } from "~/util/tailwind";
import { toast } from "~/hooks/use-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { NBTCIcon } from "~/components/icons";
import { Percentage } from "../../components/Percentage";
import { BalanceCard } from "./BalanceCard";
import { SuiConnectModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { isValidBitcoinAddress } from "~/lib/bitcoin.client";

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
	const [isProcessing, setIsProcessing] = useState(false);
	const { currentAddress, network } = useXverseWallet();
	const currentAccount = useCurrentAccount();
	const isSuiConnected = !!currentAccount;
	const nbtcBalanceRes = useCoinBalance("NBTC");

	const redeemNBTCForm = useForm<RedeemNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			numberOfNBTC: "",
			bitcoinAddress: currentAddress?.address || "",
		},
	});

	const { handleSubmit, setValue } = redeemNBTCForm;

	const maxNBTCAmount = nbtcBalanceRes ? formatNBTC(BigInt(nbtcBalanceRes.balance)) : "";

	const handleRedeemTx = async ({ numberOfNBTC, bitcoinAddress }: RedeemNBTCForm) => {
		if (!currentAccount || !nbtcBalanceRes) return;

		setIsProcessing(true);

		try {
			// TODO: Implement redeem transaction logic
			toast({
				title: "Redeem Initiated",
				description: `Redeeming ${numberOfNBTC} nBTC to ${bitcoinAddress}`,
			});

			fetchRedeemTxs();
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
						<BalanceCard />
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
										if (nbtcBalanceRes) {
											if (parseNBTC(value) <= BigInt(nbtcBalanceRes.balance)) {
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
								if (nbtcBalanceRes) {
									const val = (BigInt(nbtcBalanceRes.balance) * BigInt(value)) / 100n;
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
