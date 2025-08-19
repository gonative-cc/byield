import { FormProvider, useForm } from "react-hook-form";
import { parseSUI, SUI } from "~/lib/denoms";
import { Card, CardContent } from "~/components/ui/card";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { Button } from "~/components/ui/button";
import { FormInput } from "~/components/form/FormInput";
import { SuiModal } from "~/components/Wallet/SuiWallet/SuiModal";
import type { User } from "~/server/BeelieversAuction/types";
import { makeReq } from "~/server/BeelieversAuction/jsonrpc";
import { useFetcher } from "react-router";

import { Transaction } from "@mysten/sui/transactions";
// import { useCallback, useContext } from "react";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { LoaderCircle } from "lucide-react";

// import type { WalletAccount } from "@mysten/wallet-standard";
// import type { SuiSignAndExecuteTransactionMethod } from "@mysten/wallet-standard";

interface MyPositionProps {
	userBid?: User;
	hasUserBidBefore: boolean;
}

function MyPosition({ userBid, hasUserBidBefore }: MyPositionProps) {
	if (!userBid) return;
	return (
		<Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 animate-in slide-in-from-top-2 duration-500">
			<CardContent className="p-4 lg:p-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
							<span className="text-xl">🎯</span>
						</div>
						<div>
							<h3 className="font-semibold text-primary">Your Current Bid</h3>
							<p className="text-sm text-muted-foreground">
								{hasUserBidBefore ? `Rank ${userBid.rank}` : "No bid placed"}
							</p>
						</div>
					</div>
					{hasUserBidBefore && (
						<div className="text-right">
							<p className="text-2xl font-bold text-primary">{userBid.amount} SUI</p>
							{userBid?.note && (
								<p className="text-sm text-muted-foreground">{userBid.note}&quot;</p>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

interface BeelieversBidForm {
	bid: string;
	note: string;
}

interface BeelieversBidProps {
	userBid?: User;
}

export function BeelieversBid({ userBid }: BeelieversBidProps) {
	const { auctionBidApi } = useNetworkVariables();
	const account = useCurrentAccount();
	const suiBalanceRes = useCoinBalance();
	const { mutate: signAndExecTx, isPending, data: txData } = useSignAndExecuteTransaction();
	const fetcher = useFetcher();

	// TODO: remove WalletContext usage, use useCurrentAccount() or useSuiClient() instead!
	// const { suiAddr } = useContext(WalletContext);

	const bidForm = useForm<BeelieversBidForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending,
		defaultValues: {
			bid: "",
			note: "",
		},
	});

	if (account === null) return <SuiModal />;

	const onSubmit = bidForm.handleSubmit(async ({ bid, note }) => {
		const mistAmount = parseSUI(bid);
		const transaction = await createBidTxn(account.address, mistAmount, auctionBidApi);
		const title = "Bid NFT";
		signAndExecTx(
			{ transaction },
			{
				onSuccess: (result) => {
					console.log(
						">>>> onsuccess, tx data:",
						result.bytes,
						"\ndigest",
						result.digest,
						"\nsignature",
						result.signature,
					);
					toast({ title, description: "Bid successful" });
					// Probably we firstly need to wait for tx, before submitting to the server
					// const { effects } = await suiClient.waitForTransaction({
					// 	digest: digest,
					// 	options: {showEffects: true},
					// });
					// log --> effects?.created?.[0]?.reference?.objectId!);

					makeReq(fetcher, {
						method: "postBidTx",
						params: [account.address, result.bytes, result.signature, note],
					});
				},
				onError: (result) => {
					console.error("tx failed: ", result);
					toast({
						title,
						description: "Bid failed. Please try again later.\n" + result.message,
						variant: "destructive",
					});
				},
				onSettled: () => suiBalanceRes.refetch(),
			},
		);
	});

	const hasUserBidBefore = (userBid && userBid.amount !== 0) || false;

	return (
		<FormProvider {...bidForm}>
			<form onSubmit={onSubmit} className="flex justify-center w-full">
				<div className="w-full lg:w-2/3 xl:w-1/2 space-y-6">
					<MyPosition userBid={userBid} hasUserBidBefore={hasUserBidBefore} />

					<Card className="shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in slide-in-from-bottom-2 duration-700">
						<CardContent className="p-6 lg:p-8 rounded-lg text-white flex flex-col w-full gap-6 bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center animate-pulse-glow">
										<span className="text-2xl">🐝</span>
									</div>
									<div>
										<h2 className="text-2xl lg:text-3xl font-bold text-primary">
											Place Your Bid
										</h2>
										<p className="text-sm text-muted-foreground">
											{hasUserBidBefore
												? "Increase your bid to improve your rank"
												: "Join the auction and secure your NFT"}
										</p>
									</div>
								</div>
							</div>

							<div className="flex flex-col w-full space-y-4">
								<div className="space-y-2">
									<div className="text-sm font-medium text-foreground/80">
										<span className="text-lg">💰 </span>
										{hasUserBidBefore
											? "Enter SUI amount you want to add to your previous bid"
											: "First-time bidders: minimum bid is 1 SUI"}
									</div>
									<FormNumericInput
										required
										name="bid"
										placeholder={
											hasUserBidBefore
												? "Enter SUI amount you want to add"
												: "Minimum: 1 SUI for the first bid"
										}
										className="h-14 lg:h-16 text-lg border-primary/30 focus:border-primary hover:border-primary/50 transition-colors"
										allowNegative={false}
										decimalScale={SUI}
										createEmptySpace
										rules={{
											validate: (val: string) =>
												validateBidAmount(val, hasUserBidBefore),
										}}
									/>
								</div>
								<div className="space-y-2">
									<div className="text-sm font-medium text-foreground/80 flex items-center gap-2">
										<span className="text-lg">📝</span>
										Message to Beelievers (optional)
									</div>
									<FormInput
										name="note"
										placeholder="Add a personal note (max 30 characters)..."
										className="h-14 lg:h-16 border-primary/30 focus:border-primary hover:border-primary/50 transition-colors"
										createEmptySpace
										maxLength={30}
									/>
								</div>
								{submitButton(isPending, hasUserBidBefore)}
								{txData && <span className="break-all">Your TX ID: {txData.digest}</span>}
							</div>
						</CardContent>
					</Card>
				</div>
			</form>
		</FormProvider>
	);
}

function submitButton(isPending: boolean, hasUserBidBefore: boolean) {
	return (
		<Button
			disabled={isPending}
			className="h-14 lg:h-16 text-lg font-semibold bg-gradient-to-r from-primary to-orange-400 hover:from-orange-400 hover:to-primary transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<span className="flex items-center gap-2">
				{isPending ? (
					<LoaderCircle className="animate-spin w-64 h-64" />
				) : (
					<>
						<span className="text-xl">🚀</span> {hasUserBidBefore ? "Bid more" : "Place Bid"}
					</>
				)}
			</span>
		</Button>
	);
}

type BidCallTargets = {
	packageId: string;
	module: string;
	bidEndpoint: string;
	auctionId: string;
};

const createBidTxn = async (
	senderAddress: string,
	amountMist: bigint,
	{ packageId, module, bidEndpoint, auctionId }: BidCallTargets,
): Promise<Transaction> => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	const [coin] = txn.splitCoins(txn.gas, [txn.pure.u64(amountMist)]);
	txn.moveCall({
		target: `${packageId}::${module}::${bidEndpoint}`,
		arguments: [txn.object(auctionId), coin, txn.object.clock()],
	});
	return txn;
};

function validateBidAmount(val: string, hasUserBidBefore: boolean) {
	console.log("validating", val);
	let mistAmount = 0n;
	try {
		mistAmount = parseSUI(val);
	} catch (__error) {
		return "wrong SUI number";
	}
	if (mistAmount < 1e6) {
		return "minimum amount: 0.001";
	}
	//
	if (!hasUserBidBefore && mistAmount < 1e7) {
		// TODO: change to 1e9
		return "First-time bidders must bid at least 1 SUI";
	}

	return true;
}
