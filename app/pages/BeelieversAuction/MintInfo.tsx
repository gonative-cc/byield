import { Transaction } from "@mysten/sui/transactions";
import {
	useSignAndExecuteTransaction,
	useSuiClientContext,
	useCurrentAccount,
	useSignTransaction,
} from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import { Network } from "@mysten/kiosk";

import { Countdown } from "~/components/ui/countdown";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { formatSUI } from "~/lib/denoms";
import { classNames } from "~/util/tailwind";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { AuctionAccountType, type AuctionInfo, type User } from "~/server/BeelieversAuction/types";
import type { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { SUI_RANDOM_OBJECT_ID } from "~/lib/suienv";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { parseTxError } from "~/lib/suierr";
import { ExternalLink } from "lucide-react";

import { mkSuiVisionUrl, NftDisplay, findExistingNft } from "./nft";
import type { KioskInfo } from "./kiosk";
import { storeKioskInfo, initializeKioskInfo, createKioskTx } from "./kiosk";

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

const extractNftIdFromResult = (result: SuiTransactionBlockResponse, kioskId?: string): string | null => {
	try {
		console.log(">>> Parsing transaction result:", result);

		if (result.events) {
			console.log(">>> Events:", result.events);
			for (const event of result.events) {
				console.log(">>> Event type:", event.type);

				if (event.type.includes("::mint::NFTMinted")) {
					console.log(">>> Found NFTMinted event:", event);

					if (event.parsedJson?.nft_id) {
						console.log(">>> Extracted NFT ID from event:", event.parsedJson.nft_id);
						return event.parsedJson.nft_id;
					}
				}
			}
		}

		if (result.effects?.created) {
			console.log(">>> Created objects:", result.effects.created);
			for (const obj of result.effects.created) {
				const owner = obj.owner as { Shared?: unknown; AddressOwner?: string; ObjectOwner?: string };

				if (owner.ObjectOwner) {
					console.log(">>> Found potential NFT object:", obj.reference.objectId);
					if (obj.reference.objectId !== kioskId) {
						return obj.reference.objectId;
					}
				}
			}
		}

		console.log(">>> No NFT ID found in transaction result");
		return null;
	} catch (error) {
		console.error("Error extracting NFT ID:", error);
		return null;
	}
};

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

async function signAndExecTx(
	transaction: Transaction,
	client: SuiClient,
	signer: (Transaction) => { bytes: string; signature: string },
): Promise<SuiTransactionBlockResponse> {
	// TODO: verify if we are using the right chain here (if we switch to mainnet if this is correct)
	// Maybe just rmeove the chain so correct is deterined by wallet and client context
	// The wallet context (dapp-kit) ensures the correct chain/account is used
	//const chain = account?.chains?.[0];
	const { bytes, signature } = await signer({ transaction });

	return await client.executeTransactionBlock({
		transactionBlock: bytes,
		signature,
		options: { showEffects: true, showInput: true },
	});
}

interface MintActionProps {
	isWinner: boolean;
	doRefund: DoRefund;
	hasMinted: boolean;
	setNftId: (string) => void;
}

function MintAction({ isWinner, doRefund, hasMinted, setNftId }: MintActionProps) {
	const { beelieversAuction, beelieversMint } = useNetworkVariables();
	const { mutate: signAndExecTxAction, isPending: isRefundPending } = useSignAndExecuteTransaction();
	const { mutateAsync: signTransaction } = useSignTransaction();
	const { network, client } = useSuiClientContext();
	const account = useCurrentAccount();

	const [kioskInfo, setKioskInfo] = useState<KioskInfo | null>(null);

	const [isMinting, setIsMinting] = useState(false);

	useEffect(() => {
		if (!account) return;
		initializeKioskInfo(account.address, client, network as Network).then(setKioskInfo);
	}, [account, client, network]);

	const handleMintNFT = async () => {
		if (!account) return;
		let kioskId, kioskCapId;

		try {
			setIsMinting(true);
			if (!kioskInfo) {
				toast({
					title: "Creating Kiosk object",
					variant: "info",
					description: "Kiosk is used to store NFT",
				});

				const kioskTx = createKioskTx(client, account.address, network as Network);
				const result = await signAndExecTx(kioskTx, client, signTransaction);
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
				console.log(">>> kioskId", kioskId, kioskCapId);

				const newKioskInfo = storeKioskInfo(account.address, kioskId, kioskCapId);
				setKioskInfo(newKioskInfo);
			} else {
				kioskId = kioskInfo.kioskId;
				kioskCapId = kioskInfo.kioskCapId;
			}

			toast({ title: "Minting NFT", variant: "info" });

			const tx = createMintTx(kioskId, kioskCapId, beelieversMint, beelieversAuction.auctionId);
			const result = await signAndExecTx(tx, client, signTransaction);
			console.log(">>> mint result", result.digest, result.errors);

			const nftId = extractNftIdFromResult(result, kioskId);
			if (nftId) {
				setNftId(nftId);
				toast(createNftSuccessToast(nftId, network));
			} else {
				toast({
					title: "Minting Successful",
					description: "Successfully minted Beeliever NFT",
				});
			}
		} catch (error) {
			console.error("Error minting:", error);

			let msg = "An error occurred during minting";
			const maybeErr = (error as Error).message;
			if (maybeErr) msg = formatSuiMintErr(maybeErr);
			toast({
				title: "Minting Error",
				description: msg,
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

	const isAnyActionPending = isRefundPending || isMinting;

	// NOTE: we don't need to check account here - isWinner already has that check.
	const canMint = isWinner && beelieversMint.mintStart <= +new Date() && !hasMinted;

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
	const { client } = useSuiClientContext();
	const account = useCurrentAccount();
	const [hasMinted, setHasMinted] = useState(false);
	const [kioskInfo, setKioskInfo] = useState<KioskInfo | null>(null);
	const [nftId, setNftId] = useState<string | null>(null);

	useEffect(() => {
		const checkMintStatus = async () => {
			if (!account) return;

			const hasMintedResult = await queryHasMinted(account.address, client, beelieversMint);
			setHasMinted(!!hasMintedResult);

			if (hasMintedResult) {
				const existingNftId = await findExistingNft(
					account.address,
					client,
					kioskInfo?.kioskId || null,
					beelieversMint.packageId,
				);
				if (existingNftId) {
					setNftId(existingNftId);
				}
			}
		};

		checkMintStatus();
	}, [account, client, beelieversMint, kioskInfo]);

	if (user === null) {
		return <p className="text-xl">Connect to your wallet to see minting info</p>;
	}

	const currentBidInMist = BigInt(user.amount);
	//const isWinner = user.rank !== null && user.rank < _auctionSize;
	const isWinner = true;
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
						setNftId={setNftId}
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
	mintStart: 1756899768721;
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

export function formatSuiMintErr(err: string): string {
	const txErr = parseTxError(err);
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

async function queryHasMinted(addr: string, client: SuiClient, cfg: MintCfg): Promise<boolean | undefined> {
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

// TODO: this should be removed
if (typeof window !== "undefined") {
	window.testNftDetection = async (account, client, beelieversMint) => {
		if (!account?.address) {
			console.log("No account connected");
			return;
		}

		console.log("🧪 Testing NFT detection...");

		// Import the function from nft.tsx
		const { queryNftByModule } = await import("./nft");
		const nftByModule = await queryNftByModule(account.address, client, beelieversMint.packageId);
		console.log("NFT by module:", nftByModule);
	};
}
