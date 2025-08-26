import { Card, CardContent } from "~/components/ui/card";
import { type AuctionInfo, type User } from "~/server/BeelieversAuction/types";
import { formatSUI } from "~/lib/denoms";
import { Button } from "~/components/ui/button";
import { Transaction } from "@mysten/sui/transactions";
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { toast } from "~/hooks/use-toast";
import { delay } from "~/lib/batteries";
import { useState } from "react";

interface MintActionProps {
	refund: bigint | null;
}

function MintAction({ refund }: MintActionProps) {
	const { withdraw } = useNetworkVariables();
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const { mutate: signAndExecTx } = useSignAndExecuteTransaction();
	const client = useSuiClient();
	const account = useCurrentAccount();

	const handleRefund = async () => {
		if (!account?.address) {
			toast({ title: "SUI wallet", description: "Please connect SUI wallet", variant: "destructive" });
			return;
		}
		if (!refund) {
			toast({ title: "Refund", description: "No refund available", variant: "destructive" });
			return;
		}
		try {
			const transaction = await createWithdrawTxn(account.address, refund, withdraw);
			signAndExecTx(
				{
					transaction,
				},
				{
					onSuccess: async (result) => {
						setIsProcessing(true);
						// Probably we firstly need to wait for tx, before submitting to the server
						const { effects } = await client.waitForTransaction({
							digest: result.digest,
							options: { showEffects: true },
						});

						if (effects?.status.status === "success") {
							// delay to accomodate network propagation for sending proof of the TX
							await delay(800);
							toast({
								title: "Refund successful",
								description: `${formatSUI(refund)} SUI refunded`,
							});
						} else {
							console.error("err", effects?.status.error);
							toast({
								title: "Refund failed",
								description: "Please try again later.",
								variant: "destructive",
							});
						}
						setIsProcessing(false);
					},
					onError: (error) => {
						toast({
							title: "Refund failed",
							description: "Please try again later.\n" + error.message,
							variant: "destructive",
						});
					},
				},
			);
		} catch (_) {
			toast({
				title: "Transaction error",
				description: "Failed to create transaction",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex gap-4">
			<Button
				type="button"
				disabled={isProcessing}
				onClick={() => {
					// TODO: handle mint
				}}
			>
				Mint
			</Button>
			{refund && (
				<Button type="button" disabled={isProcessing} onClick={handleRefund}>
					Refund {formatSUI(refund)} SUI
				</Button>
			)}
		</div>
	);
}

interface MintInfoProps {
	auctionInfo: AuctionInfo;
	user?: User;
}

export function MintInfo({ user, auctionInfo: { clearingPrice } }: MintInfoProps) {
	const currentBidInMist = BigInt(user?.amount || 0);

	// TODO: get it from server
	const wonRaffle = false;
	const refund = clearingPrice ? BigInt(clearingPrice) - BigInt(currentBidInMist) : null;

	return (
		<Card className="w-full lg:w-[85%] xl:w-[75%] shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300">
			<CardContent className="p-4 lg:p-8 rounded-lg text-white flex flex-col lg:flex-row gap-6 lg:gap-8 bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15">
				<div className="flex-shrink-0 flex justify-center lg:justify-start">
					<div className="animate-float">
						<img
							src="/assets/bee/bee-with-gonative.webp"
							alt="bee-with-gonative"
							className="rounded-xl w-60 h-60"
						/>
					</div>
				</div>
				<div className="flex flex-col w-full justify-between gap-8">
					<div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
						<div className="flex justify-between items-center mb-2 w-full">
							<span className="text-sm text-muted-foreground">Mint Price:</span>
							<div className="text-lg font-semibold text-primary">
								{formatSUI(String(clearingPrice))} SUI
							</div>
						</div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm text-muted-foreground">Your bid:</span>
							<div className="text-lg font-semibold text-primary">
								{formatSUI(String(currentBidInMist))} SUI
							</div>
						</div>
						{user && (
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm text-muted-foreground">Status</span>
								<div className="text-lg font-semibold text-primary">
									{user.rank && user?.rank <= 5810
										? "Winner"
										: "Couldn't get into top 5810"}
								</div>
							</div>
						)}
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm text-muted-foreground">Raffle:</span>
							<div className="text-lg font-semibold text-primary">
								{wonRaffle ? "Won" : "Not Won"}
							</div>
						</div>
					</div>
					{user && <MintAction refund={refund} />}
				</div>
			</CardContent>
		</Card>
	);
}

type RefundCallTargets = {
	packageId: string;
	module: string;
	withdrawFunction: string;
	auctionId: string;
};

const createWithdrawTxn = async (
	senderAddress: string,
	amountMist: bigint,
	{ packageId, module, withdrawFunction, auctionId }: RefundCallTargets,
): Promise<Transaction> => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	txn.moveCall({
		target: `${packageId}::${module}::${withdrawFunction}`,
		arguments: [txn.object(auctionId)],
	});
	return txn;
};
