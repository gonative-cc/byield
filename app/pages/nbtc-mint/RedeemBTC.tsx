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
import { getBTCAddrOutputScript, isValidBitcoinAddress } from "~/lib/bitcoin.client";
import { moveCallTarget, type RedeemCfg } from "~/config/sui/contracts-config";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariables } from "~/networkConfig";
import { signAndExecTx } from "~/lib/suienv";
import { logger } from "~/lib/log";
import { BitcoinNetworkType } from "sats-connect";
import type { SuiClient } from "@mysten/sui/client";

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
		if (!currentAccount || !nbtcBalanceRes) return;

		setIsProcessing(true);

		try {
			// TODO: Implement redeem transaction logic
			toast({
				title: "Redeem Initiated",
				description: `Redeeming ${numberOfNBTC} nBTC to ${bitcoinAddress}`,
			});

			const transaction = await createRedeemBTCTxn(
				currentAccount.address,
				parseNBTC(numberOfNBTC),
				bitcoinAddress,
				redeemBTC,
				client,
				network,
			);
			const result = await signAndExecTx(transaction, client, signTransaction, {
				showEffects: true,
				showBalanceChanges: true,
			});
			logger.info({ msg: "Deposit tx:", method: "DepositModal", digest: result.digest });
			const success = result.effects?.status?.status === "success";
			// setTxStatus({ success, digest: result.digest });
			if (success) {
				// updateDeposit(amount);
				if (result.balanceChanges) {
					handleBalanceChanges(result.balanceChanges, []);
				}
			} else {
				logger.error({ msg: "Deposit FAILED", method: "DepositModal", errors: result.errors });
			}

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

async function getUserNbtcCoins(client: SuiClient, owner: string) {
	const { data } = await client.getCoins({
		owner,
		coinType: `0x50be08b805766cc1a2901b925d3fb80b6362fcb25f269cb78067429237e222ec::nbtc::NBTC`,
	});
	return data.map((coin) => coin.coinObjectId);
}

async function createRedeemBTCTxn(
	senderAddress: string,
	amount: bigint,
	recipientAddr: string,
	redeemCfg: RedeemCfg,
	client: SuiClient,
	network: BitcoinNetworkType,
): Promise<Transaction> {
	if (!redeemCfg.contractId) {
		throw new Error("Contract ID is not found");
	}
	if (!redeemCfg.pkgId) {
		throw new Error("Redeem BTC package ID is not found");
	}
	const txn = new Transaction();
	txn.setSender(senderAddress);

	const recipientScriptBuffer = await getBTCAddrOutputScript(recipientAddr, network);
	console.log(recipientScriptBuffer);
	if (!recipientScriptBuffer) throw Error("Invalid recipient address");

	const nbtcCoinIds = await getUserNbtcCoins(client, senderAddress);

	// merge all coins
	const primaryCoin = txn.object(nbtcCoinIds[0]);
	if (nbtcCoinIds.length > 1) {
		const otherCoins = nbtcCoinIds.slice(1).map((id) => txn.object(id));
		txn.mergeCoins(primaryCoin, otherCoins);
	}

	// Split exactly the desired amount for redemption
	const [redeemCoin] = txn.splitCoins(primaryCoin, [amount]);

	txn.moveCall({
		target: moveCallTarget(redeemCfg, "redeem"),
		arguments: [
			txn.object(redeemCfg.contractId),
			redeemCoin,
			txn.pure.vector("u8", recipientScriptBuffer),
			txn.object(txn.object.clock()),
		],
	});
	return txn;
}
