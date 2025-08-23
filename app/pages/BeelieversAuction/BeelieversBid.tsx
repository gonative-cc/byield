import { FormProvider, useForm } from "react-hook-form";
import { formatSUI, parseSUI, SUI } from "~/lib/denoms";
import { Card, CardContent } from "~/components/ui/card";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { Button } from "~/components/ui/button";
import { FormInput } from "~/components/form/FormInput";
import { SuiModal } from "~/components/Wallet/SuiWallet/SuiModal";
import type { User } from "~/server/BeelieversAuction/types";
import { makeReq } from "~/server/BeelieversAuction/jsonrpc";
import { useFetcher } from "react-router";
import { Transaction } from "@mysten/sui/transactions";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { LoaderCircle } from "lucide-react";
import { SUIIcon } from "~/components/icons";

import { delay } from "~/lib/batteries";

interface NewTotalBidAmountProps {
	currentBidInMist: number;
	entryBidMist: number;
	additionalBidInSUI: string;
}

function NewTotalBidAmount({ currentBidInMist, additionalBidInSUI, entryBidMist }: NewTotalBidAmountProps) {
	let newTotal = BigInt(currentBidInMist);
	let moreBidNeeded = BigInt(0);

	try {
		if (additionalBidInSUI) {
			const additionalAmount = parseSUI(additionalBidInSUI);
			newTotal = BigInt(currentBidInMist) + additionalAmount;
		}
		const remaining = BigInt(entryBidMist) - newTotal;
		moreBidNeeded = remaining > 0 ? remaining : BigInt(0);
	} catch {
		// any error
	}

	return (
		<div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
			<div className="flex justify-between items-center mb-2">
				<span className="text-sm text-muted-foreground">New total bid amount:</span>
				<div className="text-lg font-semibold text-primary">{formatSUI(String(newTotal))} SUI</div>
			</div>
			{moreBidNeeded > 0 && (
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground">
						You need to add at least
						<span className="font-semibold text-primary">
							&nbsp; {formatSUI(moreBidNeeded)} SUI &nbsp;
						</span>
						to get into the winning list. Add more to increase your chance!
					</span>
				</div>
			)}
		</div>
	);
}

interface BeelieversBidForm {
	bid: string;
	note: string;
}

interface BeelieversBidProps {
	user?: User;
	entryBidMist: number;
}

const title = "Bid NFT";

export function BeelieversBid({ user, entryBidMist }: BeelieversBidProps) {
	const { auctionBidApi } = useNetworkVariables();
	const client = useSuiClient();
	const account = useCurrentAccount();
	const suiBalanceRes = useCoinBalance();
	const fetcher = useFetcher();

	const { mutate: signAndExecTx, isPending, reset } = useSignAndExecuteTransaction();

	const bidForm = useForm<BeelieversBidForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			bid: "",
			note: "",
		},
	});

	// TODO: remove WalletContext usage, use useCurrentAccount() or useSuiClient() instead!
	// const { suiAddr } = useContext(WalletContext);

	if (account === null) return <SuiModal />;

	const onSubmit = bidForm.handleSubmit(async ({ bid, note }) => {
		const mistAmount = parseSUI(bid);
		const transaction = await createBidTxn(account.address, mistAmount, auctionBidApi);
		signAndExecTx(
			{ transaction },
			{
				onSuccess: async (result, _variables) => {
					console.log(
						">>>> onsuccess, digest: ",
						result.digest,
						"\n tx data:",
						result.bytes,
						"\nsignature",
						result.signature,
					);

					// Probably we firstly need to wait for tx, before submitting to the server
					const { effects } = await client.waitForTransaction({
						digest: result.digest,
						options: { showEffects: true },
					});

					if (effects?.status.status === "success") {
						// delay to accomodate network propagation for sending proof of the TX
						await delay(800);
						toast({ title, description: "Bid successful" });
						makeReq(fetcher, {
							method: "postBidTx",
							params: [account.address, result.bytes, result.signature, note],
						});
					} else {
						console.error("err", effects?.status.error);
						toast({
							title,
							description: "Bid failed. Please try again later.\n",
							variant: "destructive",
						});
					}
				},
				onError: (error) => {
					toast({
						title,
						description: "Bid failed. Please try again later.\n" + error.message,
						variant: "destructive",
					});
				},
				onSettled: () => {
					suiBalanceRes.refetch();
					reset();
				},
			},
		);
	});

	const hasUserBidBefore = (user && user.amount !== 0) || false;
	const bidInputInSUI = bidForm.watch("bid");

	return (
		<FormProvider {...bidForm}>
			<form onSubmit={onSubmit} className="flex justify-center w-full">
				<div className="w-full lg:w-2/3 xl:w-1/2 space-y-6">
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
										inputMode="decimal"
										decimalScale={SUI}
										allowNegative={false}
										createEmptySpace
										rightAdornments={
											<SUIIcon
												prefix={"SUI"}
												className="flex justify-end mr-1"
												containerClassName="w-full justify-end"
											/>
										}
										rules={{
											validate: (val: string) =>
												validateBidAmount(val, hasUserBidBefore),
										}}
									/>
									{hasUserBidBefore && (
										<NewTotalBidAmount
											currentBidInMist={user?.amount || 0}
											additionalBidInSUI={bidInputInSUI}
											entryBidMist={entryBidMist}
										/>
									)}
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
	let mistAmount = 0n;
	try {
		mistAmount = parseSUI(val);
	} catch (__error) {
		return "wrong SUI number";
	}
	if (mistAmount < 1e6) {
		return "minimum amount: 0.001";
	}
	// TODO: testing - change to 1e9
	if (!hasUserBidBefore && mistAmount < 1e7) {
		return "First-time bidders must bid at least 1 SUI";
	}

	return true;
}
