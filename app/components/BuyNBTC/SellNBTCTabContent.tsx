import { Transaction } from "@mysten/sui/transactions";
import { useContext, useCallback } from "react";
import { ArrowDown, ChevronRight } from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Button } from "../ui/button";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "../Wallet/SuiWallet/SuiModal";
import { useNetworkVariables } from "~/networkConfig";
import { NBTC_COINT_TYPE, NBTC_SELL_PRICE } from "~/constant";
import { ToastFunction, useToast } from "~/hooks/use-toast";
import { useNBTCBalance } from "../Wallet/SuiWallet/useNBTCBalance";
import { Modal } from "../ui/dialog";
import { useSuiBalance } from "../Wallet/SuiWallet/useSuiBalance";
import { TransactionStatus } from "./TransactionStatus";
import { NBTCIcon, SUIIcon } from "../icons";
import { SuiClient } from "@mysten/sui/client";
import { NumericInput } from "../ui/NumericInput";
import { parseNBTC } from "~/lib/denoms";

const MIN_NBTC_BALANCE = parseNBTC("0.00002");
const SUI_AMOUNT_ON_SELL = 0.5;

export function SellNBTCTabContent() {
	const { toast } = useToast();
	const client = useSuiClient();
	const account = useCurrentAccount();
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const { refetchBalance: refetchNBTCBalance } = useNBTCBalance();
	const { refetchSUIBalance } = useSuiBalance();
	const { nbtcOTC } = useNetworkVariables();
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

	const handleTransaction = useCallback(async () => {
		if (!account) {
			console.error("Account is not available. Cannot proceed with the transaction.");
			toast({
				title: "Sell nBTC",
				description: "Account is not available. Cannot proceed with the transaction.",
				variant: "destructive",
			});
			return;
		}
		const transaction = await createSellNBTCTxn(account.address, client, nbtcOTC, toast);
		if (!transaction) {
			console.error("Failed to create the transaction");
			return;
		}
		signAndExecuteTransaction(
			{
				transaction,
			},
			{
				onSettled: () => {
					refetchSUIBalance();
					refetchNBTCBalance();
				},
			},
		);
	}, [account, client, nbtcOTC, signAndExecuteTransaction, toast, refetchSUIBalance, refetchNBTCBalance]);

	const resetForm = useCallback(() => {
		resetMutation();
	}, [resetMutation]);

	return (
		<div className="flex flex-col w-full gap-2">
			<NumericInput
				className="h-16"
				value={Number(NBTC_SELL_PRICE)}
				readOnly
				rightAdornments={<NBTCIcon className="mr-5" />}
			/>
			<ArrowDown className="text-primary justify-center w-full flex p-0 m-0" />
			<NumericInput
				value={SUI_AMOUNT_ON_SELL}
				readOnly
				className="h-16"
				rightAdornments={<SUIIcon className="mr-2" />}
			/>
			{isSuiWalletConnected ? (
				<Button type="button" onClick={handleTransaction} disabled={isPending} isLoading={isPending}>
					Sell nBTC
					<ChevronRight />
				</Button>
			) : (
				<SuiModal />
			)}
			{(isSuccess || isError) && (
				<Modal title={"Sell nBTC Transaction Status"} open handleClose={resetForm}>
					<TransactionStatus
						isSuccess={data?.effects?.status?.status === "success"}
						handleRetry={resetForm}
						txnId={data?.digest}
					/>
				</Modal>
			)}
		</div>
	);
}

const getCoinObjectId = async (owner: string, client: SuiClient): Promise<string | null> => {
	const coins = await client.getCoins({
		owner,
		coinType: NBTC_COINT_TYPE,
	});
	// find coin thw min nbtc balance
	const suitableCoin = coins.data.find((coin) => BigInt(coin.balance) >= MIN_NBTC_BALANCE);
	console.log(suitableCoin);
	return suitableCoin ? suitableCoin.coinObjectId : null;
};

type Targets = {
	packageId: string;
	module: string;
	sellNBTCFunction: string;
	vaultId: string;
};

const createSellNBTCTxn = async (
	senderAddress: string,
	client: SuiClient,
	{ packageId, module, sellNBTCFunction, vaultId }: Targets,
	toast: ToastFunction,
): Promise<Transaction | null> => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	const nbtcCoinId = await getCoinObjectId(senderAddress, client);
	if (!nbtcCoinId) {
		console.error("Not enough nBTC balance available.");
		toast({
			title: "Sell nBTC",
			description: "Not enough nBTC balance available.",
			variant: "destructive",
		});
		return null;
	}
	const resultCoin = txn.moveCall({
		target: `${packageId}::${module}::${sellNBTCFunction}`,
		arguments: [txn.object(vaultId), txn.object(nbtcCoinId)],
	});
	txn.transferObjects([resultCoin], senderAddress);
	return txn;
};
