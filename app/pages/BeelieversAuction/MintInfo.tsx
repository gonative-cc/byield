import { Transaction } from "@mysten/sui/transactions";
import {
	useSignAndExecuteTransaction,
	useSuiClientContext,
	useCurrentAccount,
	useSignTransaction,
} from "@mysten/dapp-kit";
import { useState } from "react";
import { KioskClient, Network, KioskTransaction } from "@mysten/kiosk";

import { Countdown } from "~/components/ui/countdown";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { formatSUI } from "~/lib/denoms";
import { classNames } from "~/util/tailwind";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { AuctionAccountType, type AuctionInfo, type User } from "~/server/BeelieversAuction/types";
import type { SuiClient } from "@mysten/sui/client";
import { SUI_RANDOM_OBJECT_ID } from "~/lib/suienv";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";

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
}

function MintAction({ isWinner, doRefund }: MintActionProps) {
	const { beelieversAuction, beelieversMint } = useNetworkVariables();
	const { mutate: signAndExecTx, isPending } = useSignAndExecuteTransaction();
	const { mutateAsync: signTransaction } = useSignTransaction();
	const { network, client } = useSuiClientContext();
	const account = useCurrentAccount();

	const signAndExecuteTransaction = async (transaction: Transaction) => {
		const { bytes, signature } = await signTransaction({
			transaction,
			// TODO: probably there is a way without hardcoding the "sui:" prefix
			chain: "sui:" + network,
		});

		return await client.executeTransactionBlock({
			transactionBlock: bytes,
			signature,
			options: { showEffects: true, showInput: true },
		});
	};

	const [kioskInfo, setKioskInfo] = useState<{
		kioskId: string;
		kioskCapId: string;
		address: string;
	} | null>(null);

	const handleMintNFT = async () => {
		if (!account) return;
		try {
			let kioskId, kioskCapId;

			if (!kioskInfo) {
				toast({
					title: "Creating Kiosk object",
					variant: "info",
					description: "Kiosk is used to store NFT",
				});

				const kioskTx = createKioskTx(client, account.address);
				const result = await signAndExecuteTransaction(kioskTx);
				console.log("create kiosk tx ID:", result.digest);

				const effects = result.effects;
				if (effects?.created) {
					effects.created.forEach((obj) => {
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
				console.log(">>> kiosk effects", result.effects?.created);
				console.log(">>> kioskId", kioskId, kioskCapId);

				setKioskInfo({ kioskId, kioskCapId, address: account.address });
			} else {
				kioskId = kioskInfo.kioskId;
				kioskCapId = kioskInfo.kioskCapId;
			}

			toast({ title: "Minting NFT", variant: "info" });

			const tx = createMintTransaction(kioskId, kioskCapId, beelieversMint);
			const result = await signAndExecuteTransaction(tx);
			console.log(">>> mint result", result.digest, result.errors);

			toast({
				title: "Minting Successful",
				description: "Successfully minted Beeliever NFT",
			});
		} catch (error) {
			console.error("Error minting:", error);
			toast({
				title: "Minting Error",
				description: (error as Error).message || "An error occurred during minting",
				variant: "destructive",
			});
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

	// NOTE: we don't need to check account here - isWinner already has that check.
	const canMint = isWinner && beelieversMint.mintStart <= +new Date();

	// TODO, below in isLoading (both buttons), use a correct state

	return (
		<div className="flex flex-col sm:flex-row gap-4">
			{canMint && (
				<Button
					type="button"
					disabled={isPending}
					isLoading={isPending}
					size="lg"
					className="flex-1"
					onClick={handleMintNFT}
				>
					🐝 Mint
				</Button>
			)}
			{doRefund === DoRefund.NoBoosted &&
				"You have nothing to withdraw because you are a winner and your bid is below (due to boost) or at the Mint Price"}
			{doRefund === DoRefund.Yes && (
				<Button
					type="button"
					disabled={isPending}
					isLoading={isPending}
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
	const isWinner = user.rank !== null && user.rank < _auctionSize;
	const boosted = user.wlStatus > AuctionAccountType.DEFAULT;
	let doRefund: DoRefund = DoRefund.No;
	if (user.amount > 0) {
		doRefund =
			// apply boost to see if there is anything to withdraw in case he is a winner.
			isWinner && Math.round(user.amount / 1.05) <= Number(clearingPrice)
				? DoRefund.NoBoosted
				: DoRefund.Yes;
	}

	const bidLabel = boosted ? "Your Bid (5% boosted)" : "Your Bid";

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
								title={bidLabel}
								value={formatSUI(String(currentBidInMist)) + " SUI"}
							/>
							<MintInfoItem
								title="Auction Status:"
								value={isWinner ? "🎉 Winner" : "❌ Not in top 5810"}
								isLastItem
							/>
						</div>
					</div>
					<MintAction isWinner={isWinner} doRefund={doRefund} />
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

interface MintCfg {
	packageId: string;
	collectionId: string;
	transferPolicyId: string;
	auctionObjectId: string;
	mintStart: 1756899768721;
}

// TODO: move to app/lib/suienv.ts

function createMintTransaction(kioskId: string, kioskCapId: string, mintCfg: MintCfg): Transaction {
	const tx = new Transaction();
	// TODO: no need for payment - in new API we removed it.
	const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(0)]);
	console.log("payment coin", paymentCoin);
	tx.moveCall({
		target: `${mintCfg.packageId}::mint::mint`,
		arguments: [
			tx.object(mintCfg.collectionId),
			// TODO: in next iteration this must be removed (we updated API, but we need to deploy it)
			paymentCoin,
			tx.object(mintCfg.transferPolicyId),
			// TODO: random ID and clock ID is const. Probably it's defined in the SDK - so let's
			// check if it's there (you can ask Vu), otherwise, define it in app/lib/suiobj.ts (new file)
			tx.object(SUI_RANDOM_OBJECT_ID),
			tx.object(SUI_CLOCK_OBJECT_ID),
			tx.object(mintCfg.auctionObjectId),
			tx.object(kioskId),
			tx.object(kioskCapId),
		],
	});
	return tx;
}

function createKioskTx(client: SuiClient, userAddr: string): Transaction {
	const kioskClient = new KioskClient({
		// TODO: Remove this type casting once @mysten library version conflicts are resolved
		client: client as any, // eslint-disable-line @typescript-eslint/no-explicit-any
		// TODO: use network from a config
		network: Network.TESTNET,
	});

	const tx = new Transaction();
	const kioskTx = new KioskTransaction({
		transaction: tx,
		kioskClient,
	});
	kioskTx.create();
	kioskTx.shareAndTransferCap(userAddr);
	kioskTx.finalize();
	return tx;
}
