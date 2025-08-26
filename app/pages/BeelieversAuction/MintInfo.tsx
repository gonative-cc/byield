import { Card, CardContent } from "~/components/ui/card";
import { type AuctionInfo, type User } from "~/server/BeelieversAuction/types";
import { formatSUI } from "~/lib/denoms";
import { Button } from "~/components/ui/button";
import { classNames } from "~/util/tailwind";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";

interface MintInfoItemProps {
	title: string;
	value: string;
	isLastItem?: boolean;
}

function MintInfoItem({ title, value, isLastItem = false }: MintInfoItemProps) {
	return (
		<div
			className={classNames({
				"flex justify-between items-center py-2  border-primary/20": true,
				"border-b": !isLastItem,
			})}
		>
			<span className="text-base text-muted-foreground font-medium">{title}</span>
			<div className="text-xl font-bold text-primary">{value}</div>
		</div>
	);
}

interface MintActionProps {
	isUserEligibleForMinting: boolean;
	refund: bigint | null;
}

// TODO: determine if user has claimed before or not
function MintAction({ isUserEligibleForMinting, refund }: MintActionProps) {
	const { auctionBidApi } = useNetworkVariables();
	const { mutate: signAndExecTx, isPending } = useSignAndExecuteTransaction();
	const client = useSuiClient();
	const account = useCurrentAccount();
	const isUserEligibleForRefund = (refund && refund > 0) || false;

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
			const transaction = await createWithdrawTxn(account.address, auctionBidApi);
			signAndExecTx(
				{ transaction },
				{
					onSuccess: async (result) => {
						const { effects } = await client.waitForTransaction({
							digest: result.digest,
							options: { showEffects: true },
						});

						if (effects?.status.status === "success") {
							toast({
								title: "Refund successful",
								description: `${formatSUI(refund)} SUI refunded`,
							});
						} else {
							console.error("Claim tx error: ", effects?.status.error);
							toast({
								title: "Refund failed",
								description: "Please try again later.",
								variant: "destructive",
							});
						}
					},
					onError: (error) => {
						console.error("Claim tx error:", error);
						toast({
							title: "Refund failed",
							description: "Please try again later.\n" + error.message,
							variant: "destructive",
						});
					},
				},
			);
		} catch (error) {
			console.error("Claim tx error:", error);
			toast({
				title: "Transaction error",
				description: "Failed to create transaction.\n" + error,
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex flex-col sm:flex-row gap-4">
			{isUserEligibleForMinting && (
				<Button
					type="button"
					disabled={isPending}
					size="lg"
					className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
					onClick={() => {
						// TODO: handle mint
					}}
				>
					🐝 Mint
				</Button>
			)}
			{isUserEligibleForRefund && refund && (
				<Button
					type="button"
					disabled={isPending}
					size="lg"
					variant="outline"
					className="flex-1 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
					onClick={handleRefund}
				>
					💰 Refund {formatSUI(refund)} SUI
				</Button>
			)}
		</div>
	);
}

interface MintInfoProps {
	auctionInfo: AuctionInfo;
	user?: User;
}

export function MintInfo({ user, auctionInfo: { clearingPrice, auctionSize } }: MintInfoProps) {
	const currentBidInMist = BigInt(user?.amount || 0);
	const isUserInTop5810 = user && user.rank && user?.rank <= 5810;
	// user rank is less than or equal to auction size
	const isUserEligibleForMinting = (user && user.rank && user.rank <= auctionSize) || false;

	let refund: bigint | null = null;
	try {
		refund = clearingPrice ? BigInt(clearingPrice) - currentBidInMist : null;
	} catch (e) {
		console.error("Failed to calculate the refund", e);
	}

	return (
		<Card className="w-full lg:w-[85%] xl:w-[75%] shadow-2xl border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-primary/10">
			<CardContent className="p-4 lg:p-8 rounded-lg text-white flex flex-col lg:flex-row gap-8 lg:gap-12 bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15">
				<div className="flex-shrink-0 flex justify-center lg:justify-start">
					<div className="animate-float">
						<div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl"></div>
						<img
							src="/assets/bee/bee-with-gonative.webp"
							alt="bee-with-gonative"
							className="relative rounded-xl w-64 h-64 lg:w-72 lg:h-72 object-cover border-2 border-primary/30"
						/>
					</div>
				</div>
				<div className="flex flex-col w-full justify-between gap-8">
					<div className="space-y-4">
						<h3 className="text-xl lg:text-2xl font-bold text-primary">Mint Details</h3>
						<div className="p-4 bg-primary/15 rounded-xl border border-primary/30 backdrop-blur-sm space-y-4">
							<MintInfoItem
								title="Mint Price:"
								value={formatSUI(String(clearingPrice)) + " SUI"}
							/>
							<MintInfoItem
								title="Your Bid:"
								value={formatSUI(String(currentBidInMist)) + " SUI"}
							/>
							{user && (
								<MintInfoItem
									title="Status:"
									value={isUserInTop5810 ? "🎉 Winner" : "❌ Not in top 5810"}
								/>
							)}
							<MintInfoItem
								title="Raffle:"
								value={isUserInTop5810 ? "🎊 Won" : "Not won"}
								isLastItem
							/>
						</div>
					</div>
					{user && (
						<MintAction isUserEligibleForMinting={isUserEligibleForMinting} refund={refund} />
					)}
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
