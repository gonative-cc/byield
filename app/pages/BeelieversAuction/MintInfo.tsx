import { useState, useEffect } from "react";
import { Transaction } from "@mysten/sui/transactions";
import type { SuiClient } from "@mysten/sui/client";
import {
	useSignAndExecuteTransaction,
	useSuiClientContext,
	useCurrentAccount,
	useSignTransaction,
} from "@mysten/dapp-kit";
import { ExternalLink } from "lucide-react";

import { Countdown } from "~/components/ui/countdown";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { formatSUI } from "~/lib/denoms";
import { classNames } from "~/util/tailwind";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { AuctionAccountType, type AuctionInfo, type User } from "~/server/BeelieversAuction/types";
import { signAndExecTx, SUI_RANDOM_OBJECT_ID } from "~/lib/suienv";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { parseTxError } from "~/lib/suierr";

import { mkSuiVisionUrl, NftDisplay, findExistingNft, findNftInTxResult, queryNftFromKiosk } from "./nft";
import type { KioskInfo } from "./kiosk";
import { initializeKioskInfo, createKiosk } from "./kiosk";
import { delay } from "~/lib/batteries";

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

const createNftSuccessToast = (nftId: string, network: string) => {
	const suiVisionUrl = mkSuiVisionUrl(nftId, network);

	return {
		title: "Minting Successful! 🎉",
		description: (
			<div className="space-y-2">
				<p>Successfully minted Beeliever NFT</p>
				<a
					href={suiVisionUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
				>
					<ExternalLink size={16} />
					View NFT on SuiVision
				</a>
			</div>
		),
		duration: 10000,
	};
};

interface MintActionProps {
	isWinner: boolean;
	doRefund: DoRefund;
	hasMinted: boolean;
	setNftId: (nft_id: string) => void;
	kiosk: KioskInfo | null;
	setKiosk: (ki: KioskInfo) => void;
}

function MintAction({ isWinner, doRefund, hasMinted, setNftId, kiosk, setKiosk }: MintActionProps) {
	const { beelieversAuction, beelieversMint } = useNetworkVariables();
	const { mutate: signAndExecTxAction, isPending: isRefundPending } = useSignAndExecuteTransaction();
	const { mutateAsync: signTransaction } = useSignTransaction();
	const { network, client } = useSuiClientContext();
	const account = useCurrentAccount();
	const [isMinting, setIsMinting] = useState(false);

	const handleMintNFT = async () => {
		if (!account) return;
		let kioskId, kioskCapId;
		let kioskInfo2 = kiosk;

		try {
			setIsMinting(true);
			if (!kioskInfo2) {
				kioskInfo2 = await createKiosk(account.address, client, network, signTransaction);
				setKiosk(kioskInfo2);
			}
			kioskId = kioskInfo2.kioskId;
			kioskCapId = kioskInfo2.kioskCapId;

			const tx = createMintTx(kioskId, kioskCapId, beelieversMint, beelieversAuction.auctionId);

			// Set sender before dry run check
			tx.setSender(account.address);

			// Do dry run check BEFORE sending to wallet
			console.log("Running pre-transaction validation...");
			await client.dryRunTransactionBlock({
				transactionBlock: await tx.build({ client }),
			});

			const tx = createMintTx(kioskId, kioskCapId, beelieversMint, beelieversAuction.auctionId);

			// Set sender before dry run check
			tx.setSender(account.address);

			// Do dry run check BEFORE sending to wallet
			console.log("Running pre-transaction validation...");
			await client.dryRunTransactionBlock({
				transactionBlock: await tx.build({ client }),
			});

			toast({ title: "Minting NFT", variant: "info" });

			const result = await signAndExecTx(tx, client, signTransaction);
			console.log(">>> Mint tx:", result.digest);
			if (result.errors) {
				console.log(">>> Mint FAILED", result.errors);
			}

			const nftId = findNftInTxResult(result);
			await delay(1400); // we need to delay a bit to make sure indexers will get the data
			if (nftId) {
				setNftId(nftId);
				toast(createNftSuccessToast(nftId, network));
			} else {
				console.log("nft not found in tx result, checking querying indexer with kiosk");
				const nftFromKiosk = await queryNftFromKiosk(kioskId, beelieversMint.packageId, client);
				if (nftFromKiosk) {
					setNftId(nftFromKiosk);
					toast(createNftSuccessToast(nftFromKiosk, network));
				} else {
					toast({
						title: "Minting Successful",
						description: "Successfully minted Beeliever NFT. Check explorer to find your NFT",
					});
				}
			}
		} catch (error) {
			console.error("Error minting:", error);

			if (handleDryRunError(error as Error)) {
				return;
			}

			let msg = "An error occurred during minting";
			const maybeErr = (error as Error).message;
			if (maybeErr) msg = formatSuiMintErr(maybeErr);
			toast({
				title: "Minting Error",
				description: formatSuiMintErr(error),
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
			signAndExecTxAction(
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
	const canMint = isWinner && beelieversMint.mintStart <= +new Date() && !hasMinted;
	const isAnyActionPending = isRefundPending || isMinting;

	return (
		<div className="flex flex-col sm:flex-row gap-4">
			{canMint && (
				<Button
					type="button"
					disabled={isAnyActionPending}
					isLoading={isMinting}
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
					disabled={isAnyActionPending}
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
	const { client, network } = useSuiClientContext();
	const account = useCurrentAccount();
	const [hasMinted, setHasMinted] = useState(false);
	const [nftId, setNftId] = useState<string | null>(null);

	const [kiosk, setKiosk] = useState<KioskInfo | null>(null);
	const userAddr = account?.address || null;

	useEffect(() => {
		const initialize = async () => {
			if (!userAddr) {
				setKiosk(null);
				setNftId(null);
				setHasMinted(false);
				return;
			}

			const hasMinted = await queryHasMinted(userAddr, client, beelieversMint);
			setHasMinted(hasMinted);

			const kiosk = await initializeKioskInfo(userAddr, client, network);
			setKiosk(kiosk);
			console.log(">>> MintInfo: Loaded kiosk for address:", userAddr, kiosk);

			if (hasMinted) {
				const existingNftId = await findExistingNft(
					userAddr,
					client,
					beelieversMint.packageId,
					kiosk?.kioskId,
				);
				if (existingNftId) {
					setNftId(existingNftId);
					console.log(">>> MintInfo: Found existing NFT for address:", userAddr, existingNftId);
				}
			}
		};

		initialize();
	}, [userAddr, client, beelieversMint, network]);

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
	const mintStarted = beelieversMint.mintStart <= +new Date();

	return (
		<Card className="lg:w-[85%] xl:w-[75%] w-full shadow-2xl border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-primary/10">
			<CardContent className="p-4 lg:p-8 rounded-lg text-white flex flex-col xl:flex-row gap-6 sm:gap-8 lg:gap-12 bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15">
				<div className="flex-shrink-0 flex justify-center xl:justify-start w-full xl:w-auto">
					{nftId ? (
						<NftDisplay nftId={nftId} />
					) : (
						<div className="animate-float">
							<div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl"></div>
							<img
								src="/assets/bee/beeliever-unknown.webp"
								alt="bee-with-gonative"
								className="rounded-xl w-64 h-64 lg:w-72 lg:h-72 object-cover border-2 border-primary/30"
							/>
						</div>
					)}
				</div>
				<div className="flex flex-col w-full justify-between gap-8">
					<div className="space-y-4">
						<h3 className="text-xl lg:text-2xl font-bold text-primary">Mint Details</h3>
						<div className="p-4 bg-primary/15 rounded-xl border border-primary/30 backdrop-blur-sm space-y-4">
							{!mintStarted && (
								<div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 font-semibold text-primary">
									<span className="text-2xl">⏰</span>
									<span className="text-sm"> Minting starts in </span>
									<Countdown targetTime={beelieversMint.mintStart} />
								</div>
							)}

							<MintInfoItem
								title="Mint Price:"
								value={clearingPrice ? formatSUI(clearingPrice) + " SUI" : ""}
							/>
							<MintInfoItem title={bidLabel} value={formatSUI(user.amount) + " SUI"} />
							<MintInfoItem
								title="Auction Status:"
								value={isWinner ? "🎉 Winner" : "❌ Not in top 5810"}
							/>
							<MintInfoItem
								title="Mint Status:"
								value={hasMinted ? "✅ Minted" : "⏳ Not Minted"}
								isLastItem
							/>
						</div>
					</div>

					<MintAction
						isWinner={isWinner}
						doRefund={doRefund}
						hasMinted={hasMinted}
						setNftId={(nid) => {
							setNftId(nid);
							setHasMinted(true);
						}}
						kiosk={kiosk}
						setKiosk={setKiosk}
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

interface MintCfg {
	packageId: string;
	collectionId: string;
	transferPolicyId: string;
	//Change this when deploying to mainnet
	mintStart: 1756899768721 | 1757192400000;
}

function createMintTx(kioskId: string, kioskCapId: string, mintCfg: MintCfg, auctionId: string): Transaction {
	const tx = new Transaction();

	tx.moveCall({
		target: `${mintCfg.packageId}::mint::mint`,
		arguments: [
			tx.object(mintCfg.collectionId),
			tx.object(mintCfg.transferPolicyId),
			tx.object(SUI_RANDOM_OBJECT_ID),
			tx.object(SUI_CLOCK_OBJECT_ID),
			tx.object(auctionId),
			tx.object(kioskId),
			tx.object(kioskCapId),
		],
	});
	return tx;
}

export function formatSuiMintErr(error: unknown): string {
	const errMsg = (error as Error).message;
	if (!errMsg) return "An error occurred during minting";

	const txErr = parseTxError(errMsg);
	if (!txErr) return "Sui tx failed, unknown error";
	if (typeof txErr === "string") return txErr;

	let reason = "unknown";
	switch (txErr.errCode) {
		case 1: {
			reason = "all NFTs are alaready minted";
			break;
		}
		case 2: {
			reason = "minting not active";
			break;
		}
		case 3: {
			reason = "unauthorized: user didn't win the auction";
			break;
		}
		case 4: {
			reason = "user already minted";
			break;
		}
		case 10: {
			reason = "tx provided wrong auction contract for verification";
			break;
		}
	}

	return `Tx aborted, function: ${txErr.funName} reason: "${reason}"`;
}

async function queryHasMinted(addr: string, client: SuiClient, cfg: MintCfg): Promise<boolean> {
	try {
		const txb = new Transaction();
		txb.moveCall({
			target: `${cfg.packageId}::mint::has_minted`,
			arguments: [txb.object(cfg.collectionId), txb.pure.address(addr)],
		});

		const result = await client.devInspectTransactionBlock({
			sender: addr,
			transactionBlock: txb,
		});

		return result.results?.[0]?.returnValues?.[0]?.[0]?.[0] === 1;
	} catch (error) {
		console.error("Error checking mint status:", error);
		return false;
	}
}

const handleDryRunError = (error: Error): boolean => {
	const errorMessage = error.message;

	if (errorMessage.includes("Dry run failed") || errorMessage.includes("MoveAbort")) {
		console.error("Dry run failed:", errorMessage);

		let userMessage = "Transaction simulation failed. Please check your inputs and try again.";

		const parsedError = parseTxError(errorMessage);
		if (parsedError && typeof parsedError === "object") {
			userMessage = formatSuiMintErr(errorMessage);
		} else if (typeof parsedError === "string") {
			userMessage = parsedError;
		}

		toast({
			title: "Transaction Check Failed",
			description: (
				<div className="space-y-2">
					<p className="font-medium">⚠️ Pre-transaction validation failed</p>
					<p className="text-sm">{userMessage}</p>
					<p className="text-xs text-muted-foreground">
						This transaction would likely fail. Please review your inputs before proceeding.
					</p>
				</div>
			),
			variant: "destructive",
			duration: 8000,
		});

		return true;
	}

	return false;
};
