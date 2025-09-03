import { Transaction } from "@mysten/sui/transactions";
import {
	useSignAndExecuteTransaction,
	useSuiClient,
	useCurrentAccount,
	useSignTransaction,
} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { KioskClient, Network, KioskTransaction } from "@mysten/kiosk";
import { LoaderCircle } from "lucide-react";

import { Countdown } from "~/components/ui/countdown";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { formatSUI } from "~/lib/denoms";
import { classNames } from "~/util/tailwind";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { AuctionAccountType, type AuctionInfo, type User } from "~/server/BeelieversAuction/types";

const PACKAGE_ID = "0x3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c";
const COLLECTION_OBJECT_ID = "0x6a41d0a1b90172e558ec08169dff16dbe2b7d0d99d9c5f6164f00b6ae1c245a1";
const TRANSFER_POLICY_ID = "0xef61e56ab17cac808a79bd5741054a3167f80608f4eb3908ff129ce0769fec40";
const AUCTION_OBJECT_ID = "0x5ae4810b0a0a30b5767c3da561f2fb64315167a9cfa809ad877e1f5902cb2e41";
const RANDOM_ID = "0x8";
const CLOCK_ID = "0x6";

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
	isWinner: boolean;
	doRefund: DoRefund;
	clearingPrice: bigint;
}

function MintAction({ isWinner, doRefund, clearingPrice }: MintActionProps) {
	const { beelieversAuction } = useNetworkVariables();
	const { mutate: signAndExecTx, isPending: isRefundPending } = useSignAndExecuteTransaction();
	const { mutateAsync: signTransaction } = useSignTransaction();
	const client = useSuiClient();
	const account = useCurrentAccount();

	const [isMinting, setIsMinting] = useState(false);
	const [isEligible, setIsEligible] = useState(false);
	const [kioskInfo, setKioskInfo] = useState<{
		kioskId: string;
		kioskCapId: string;
		address: string;
	} | null>(null);

	const kioskClient = new KioskClient({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		client: client as any, // Package version conflict between @mysten libraries
		network: Network.TESTNET,
	});

	useEffect(() => {
		if (account) {
			setIsEligible(true);
			console.log("TESTING: Set isEligible to true");
		}
	}, [account]);

	const mintNFT = async () => {
		if (!account) return;
		try {
			setIsMinting(true);
			let kioskId, kioskCapId;

			if (!kioskInfo) {
				const tx = new Transaction();
				const kioskTx = new KioskTransaction({
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					transaction: tx as any, // Package version conflict
					kioskClient,
				});
				kioskTx.create();
				kioskTx.shareAndTransferCap(account.address);
				kioskTx.finalize();

				const { bytes, signature } = await signTransaction({
					transaction: tx,
					chain: "sui:testnet",
				});

				const result = await client.executeTransactionBlock({
					transactionBlock: bytes,
					signature,
					options: { showEffects: true, showInput: true, showRawEffects: true },
				});

				await new Promise((resolve) => setTimeout(resolve, 5000));
				const txBlock = await client.getTransactionBlock({
					digest: result.digest,
					options: { showEffects: true, showInput: true },
				});

				if (txBlock.effects && txBlock.effects.created) {
					txBlock.effects.created.forEach((obj) => {
						const owner = obj.owner as { Shared?: unknown; AddressOwner?: string };
						if (owner.Shared) {
							kioskId = obj.reference.objectId;
						} else if (owner.AddressOwner === account.address) {
							kioskCapId = obj.reference.objectId;
						}
					});
				}

				if (!kioskId || !kioskCapId) {
					throw new Error("Failed to retrieve kiosk or kiosk cap ID");
				}

				setKioskInfo({ kioskId, kioskCapId, address: account.address });
			} else {
				kioskId = kioskInfo.kioskId;
				kioskCapId = kioskInfo.kioskCapId;
			}

			const tx = new Transaction();
			const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(clearingPrice)]);
			tx.moveCall({
				target: `${PACKAGE_ID}::mint::mint`,
				arguments: [
					tx.object(COLLECTION_OBJECT_ID),
					paymentCoin,
					tx.object(TRANSFER_POLICY_ID),
					tx.object(RANDOM_ID),
					tx.object(CLOCK_ID),
					tx.object(AUCTION_OBJECT_ID),
					tx.object(kioskId),
					tx.object(kioskCapId),
				],
			});

			const { bytes, signature } = await signTransaction({
				transaction: tx,
				chain: "sui:testnet",
			});

			await client.executeTransactionBlock({
				transactionBlock: bytes,
				signature,
				options: { showEffects: true, showInput: true },
			});

			toast({
				title: "Minting Successful",
				description: "Successfully minted Beeliever NFT",
				variant: "default",
			});
		} catch (error) {
			console.error("Error minting:", error);
			toast({
				title: "Minting Error",
				description: (error as Error).message || "An error occurred during minting",
				variant: "destructive",
			});
		} finally {
			setIsMinting(false);
		}
	};

	const handleRefund = async () => {
		if (!account?.address) {
			toast({ title: "SUI wallet", description: "Please connect SUI wallet", variant: "destructive" });
			return;
		}
		try {
			const transaction = await createWithdrawTxn(account.address, beelieversAuction);
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
								description: `SUI refunded`,
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

	const isPending = isRefundPending || isMinting;

	return (
		<div className="flex flex-col sm:flex-row gap-4">
			{isWinner && isEligible && (
				<Button type="button" disabled={isPending} size="lg" className="flex-1" onClick={mintNFT}>
					{isMinting ? (
						<span className="flex items-center gap-2">
							<LoaderCircle className="animate-spin w-6 h-6" />
							Minting...
						</span>
					) : (
						"🐝 Mint"
					)}
				</Button>
			)}
			{doRefund === DoRefund.NoBoosted &&
				"You have nothing to withdraw because you are a winner and your bid is below (due to boost) or at the Mint Price"}
			{doRefund === DoRefund.Yes && (
				<Button
					type="button"
					disabled={isPending}
					isLoading={isRefundPending}
					size="lg"
					variant="outline"
					className="flex-1"
					onClick={handleRefund}
				>
					💰 Refund
					<div className="text-small text-muted-foreground">
						NOTE: if you already claimed refund, subsequent claim will fail
					</div>
				</Button>
			)}
		</div>
	);
}

enum DoRefund {
	No = 0,
	Yes = 1,
	NoBoosted = 2,
}

interface MintInfoProps {
	auctionInfo: AuctionInfo;
	user: User | null;
}

export function MintInfo({ user, auctionInfo: { clearingPrice, auctionSize: _auctionSize } }: MintInfoProps) {
	const { beelieversMint } = useNetworkVariables();

	if (user === null) {
		return <p className="text-xl">Connect to your wallet to see minting info</p>;
	}

	const currentBidInMist = BigInt(user.amount);
	const isWinner = true; // TESTING: Force winner status
	const boosted = user.wlStatus > AuctionAccountType.DEFAULT;
	let doRefund: DoRefund = DoRefund.No;
	if (user.amount > 0) {
		doRefund =
			// apply boost to see if there is anything to withdraw in case he is a winner.
			isWinner && Math.round(user.amount / 1.05) <= Number(clearingPrice)
				? DoRefund.NoBoosted
				: DoRefund.Yes;
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
							<div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 font-semibold text-primary">
								<span className="text-2xl">⏰</span>
								<span className="text-sm"> Minting starts in </span>
								<Countdown targetTime={beelieversMint.mintStart} />
							</div>

							<MintInfoItem
								title="Mint Price:"
								value={formatSUI(String(clearingPrice)) + " SUI"}
							/>
							<MintInfoItem
								title={`Your Bid ${boosted ? "(5% boosted)" : ""}:`}
								value={formatSUI(String(currentBidInMist)) + " SUI"}
							/>
							<MintInfoItem
								title="Auction Status:"
								value={isWinner ? "🎉 Winner" : "❌ Not in top 5810"}
								isLastItem
							/>
						</div>
					</div>
					<MintAction
						isWinner={isWinner}
						doRefund={doRefund}
						clearingPrice={BigInt(clearingPrice || 0)}
					/>
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
