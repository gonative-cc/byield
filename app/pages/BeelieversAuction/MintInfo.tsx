import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Transaction } from "@mysten/sui/transactions";
import type { SuiClient } from "@mysten/sui/client";
import { Network } from "@mysten/kiosk";
import {
	useSignAndExecuteTransaction,
	useSuiClientContext,
	useCurrentAccount,
	useSignTransaction,
} from "@mysten/dapp-kit";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";

import { Countdown } from "~/components/ui/countdown";
import { classNames, primaryHeadingClasses, GRADIENTS } from "~/tailwind";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { AuctionAccountType, type AuctionInfo, type User } from "~/server/BeelieversAuction/types";
import { signAndExecTx, SUI_RANDOM_OBJECT_ID, mkSuiVisionUrl } from "~/lib/suienv";
import { formatSUI } from "~/lib/denoms";
import { parseTxError, formatSuiErr } from "~/lib/suierr";
import type { BeelieversAuctionCfg, BeelieversMintCfg, ContractsCfg } from "~/config/sui/contracts-config";
import { moveCallTarget } from "~/config/sui/contracts-config";
import { delay } from "~/lib/batteries";

import { NftDisplay, findExistingNft, findNftInTxResult, queryNftFromKiosk } from "./nft";
import type { KioskInfo } from "./kiosk";
import { initializeKioskInfo, createKiosk } from "./kiosk";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { cardShowcaseClasses, cn, primaryBadgeClasses } from "~/tailwind";
import { logError, logger } from "~/lib/log";

interface MintInfoItemProps {
	title: string;
	value: string;
	isLastItem?: boolean;
}

function MintInfoItem({ title, value, isLastItem = false }: MintInfoItemProps) {
	return (
		<div
			className={classNames({
				"border-primary/20 flex items-center justify-between py-2": true,
				"border-b": !isLastItem,
			})}
		>
			<span className="text-base-content/75 text-base font-medium">{title}</span>
			<div className="text-primary text-xl font-bold">{value}</div>
		</div>
	);
}

const createNftSuccessToast = (nftId: string, contractsConfig: ContractsCfg) => {
	const suiVisionUrl = mkSuiVisionUrl(nftId, contractsConfig);

	return {
		title: "Minting Successful! 🎉",
		description: (
			<div className="space-y-2">
				<p>Successfully minted Beeliever NFT</p>
				<a
					href={suiVisionUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
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
	const contractsConfig = useNetworkVariables();
	const { beelieversAuction, beelieversMint } = contractsConfig;
	const { mutate: signAndExecTxAction, isPending: isRefundPending } = useSignAndExecuteTransaction();
	const { mutateAsync: signTransaction } = useSignTransaction();
	const { network, client } = useSuiClientContext();
	const account = useCurrentAccount();
	const [isMinting, setIsMinting] = useState(false);

	const handleMintNFT = async () => {
		if (!account) return;
		let kioskId, kioskCapId;
		let minterKiosk = kiosk;

		try {
			setIsMinting(true);
			if (!minterKiosk) {
				minterKiosk = await createKiosk(account.address, client, network as Network, signTransaction);
				setKiosk(minterKiosk);
			}
			kioskId = minterKiosk.kioskId;
			kioskCapId = minterKiosk.kioskCapId;

			const tx = createMintTx(kioskId, kioskCapId, beelieversMint, beelieversAuction.auctionId);

			toast({ title: "Minting NFT", variant: "info" });

			const result = await signAndExecTx(tx, client, signTransaction);
			logger.info({ msg: ">>>> Mint tx:", method: "MintInfo", digest: result.digest });
			if (result.errors) {
				logger.error({ msg: ">>>> Mint FAILED", method: "MintInfo", errors: result.errors });
			}

			const nftId = findNftInTxResult(result);
			// we need to delay a bit to make sure RPC nodes will get the data
			await delay(1600);
			if (nftId) {
				setNftId(nftId);
				toast(createNftSuccessToast(nftId, contractsConfig));
			} else {
				logger.info({
					msg: "nft not found in tx result, checking querying indexer with kiosk",
					method: "MintInfo",
					kioskId,
				});
				const nftFromKiosk = await queryNftFromKiosk(kioskId, beelieversMint.pkgId, client);
				if (nftFromKiosk) {
					setNftId(nftFromKiosk);
					toast(createNftSuccessToast(nftFromKiosk, contractsConfig));
				} else {
					toast({
						title: "Minting Successful",
						description: "Successfully minted Beeliever NFT. Check explorer to find your NFT",
					});
				}
			}
		} catch (error) {
			logError({ msg: "Error minting", method: "MintInfo" }, error);

			const userMessage = handleMintError(error);

			toast({
				title: "Minting Error",
				description: userMessage,
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
							logError(
								{
									msg: "Claim tx error",
									method: "MintInfo:handleRefund",
								},
								effects?.status.error,
							);
							toast({
								title: "Refund failed",
								description: "Please try again later.",
								variant: "destructive",
							});
						}
					},
					onError: (error) => {
						logError({ msg: "Claim tx error", method: "MintInfo:handleRefund" }, error);

						toast({
							title: "Refund failed",
							description: handleRefundError(error),
							variant: "destructive",
						});
					},
				},
			);
		} catch (error) {
			logError({ msg: "Claim tx error (outer catch)", method: "MintInfo:refund" }, error);

			toast({
				title: "Transaction error",
				description: handleRefundError(error),
				variant: "destructive",
			});
		}
	};

	// NOTE: we don't need to check account here - isWinner already has that check.
	const canMint = isWinner && beelieversMint.mintStart <= +new Date() && !hasMinted;
	const isAnyActionPending = isRefundPending || isMinting;

	return (
		<div className="flex flex-col gap-4 sm:flex-row">
			{canMint && (
				<button
					disabled={isAnyActionPending}
					className="btn btn-primary btn-lg flex-1"
					onClick={handleMintNFT}
				>
					<LoadingSpinner isLoading={isMinting} />
					🐝 Mint
				</button>
			)}
			{doRefund === DoRefund.NoBoosted &&
				"You have nothing to withdraw because you are a winner and your bid is below (due to boost) or at the Mint Price"}
			{doRefund === DoRefund.Yes && (
				<button
					disabled={isAnyActionPending}
					className="btn btn-primary btn-outline btn-lg h-16 flex-1 flex-col"
					onClick={handleRefund}
				>
					<LoadingSpinner isLoading={isRefundPending} />
					💰 Refund
					<div className="text-base-content/75 text-sm">
						NOTE: if you already claimed refund, subsequent claim will fail
					</div>
				</button>
			)}
		</div>
	);
}

function handleMintError(error: unknown): string {
	const errorMessage = (error as Error).message;
	let userMessage = "An error occurred during minting";

	if (errorMessage) {
		const parsedError = parseTxError(errorMessage);
		if (parsedError && typeof parsedError === "object") {
			userMessage = formatSuiMintErr(parsedError);
		} else if (typeof parsedError === "string") {
			userMessage = parsedError;
		} else {
			userMessage = formatSuiMintErr(error);
		}
	}

	return userMessage;
}

function handleRefundError(error: unknown): string {
	const errorMessage = (error as Error).message;
	let userMessage = "An error occurred during refund";

	if (errorMessage) {
		const parsedError = parseTxError(errorMessage);
		if (parsedError && typeof parsedError === "object") {
			userMessage = formatSuiRefundErr(parsedError);
		} else if (typeof parsedError === "string") {
			userMessage = parsedError;
		} else {
			userMessage = formatSuiRefundErr(error);
		}
	}

	return userMessage;
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

			const kiosk = await initializeKioskInfo(userAddr, client, network as Network);
			setKiosk(kiosk);
			logger.debug({ msg: ">>> Loaded kiosk for address", method: "MintInfo", userAddr, kiosk });

			if (hasMinted) {
				const existingNftId = await findExistingNft(
					userAddr,
					client,
					beelieversMint.pkgId,
					kiosk?.kioskId,
				);
				if (existingNftId) {
					setNftId(existingNftId);
					logger.debug({
						msg: ">>> Found existing NFT for address",
						method: "MintInfo",
						userAddr,
						existingNftId,
					});
				}
			}
		};

		initialize();
	}, [userAddr, client, beelieversMint, network]);

	if (user === null) {
		return <p className="text-xl">Connect to your wallet to see minting info</p>;
	}

	const isWinner = user.rank !== null && user.rank <= _auctionSize;
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
		<div className={cn(cardShowcaseClasses(), "card hover:shadow-primary/10 w-full md:w-3/4")}>
			<div
				className={`card-body ${GRADIENTS.azureCard} flex flex-col gap-6 rounded-lg p-4 text-white sm:gap-8 lg:gap-12 lg:p-8 xl:flex-row`}
			>
				<div className="flex w-full flex-shrink-0 justify-center xl:w-auto xl:justify-start">
					{nftId ? (
						<NftDisplay nftId={nftId} />
					) : (
						<div className="animate-float">
							<div className="bg-primary/20 absolute inset-0 rounded-xl blur-xl"></div>
							<img
								src="/assets/bee/beeliever-unknown.webp"
								alt="bee-with-gonative"
								className="border-primary/30 h-64 w-64 rounded-xl border-2 object-cover lg:h-72 lg:w-72"
							/>
						</div>
					)}
				</div>
				<div className="flex w-full flex-col justify-between gap-8">
					<div className="space-y-4">
						<h3 className={`${primaryHeadingClasses()} text-xl lg:text-2xl`}>Mint Details</h3>
						<div className="bg-primary/15 border-primary/30 space-y-4 rounded-xl border p-4 backdrop-blur-sm">
							{!mintStarted && (
								<div className={primaryBadgeClasses()}>
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
			</div>
		</div>
	);
}

const createWithdrawTxn = async (senderAddress: string, cfg: BeelieversAuctionCfg): Promise<Transaction> => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	txn.moveCall({
		target: moveCallTarget(cfg, "withdraw"),
		arguments: [txn.object(cfg.auctionId)],
	});
	return txn;
};

function createMintTx(
	kioskId: string,
	kioskCapId: string,
	mintCfg: BeelieversMintCfg,
	auctionId: string,
): Transaction {
	const tx = new Transaction();

	tx.moveCall({
		target: `${mintCfg.pkgId}::mint::mint`,
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
	// Handle both string and Error object inputs
	return formatSuiErr(
		error,
		(errCode: number) => {
			switch (errCode) {
				case 1:
					return "all NFTs are alaready minted";
				case 2:
					return "minting not active";
				case 3:
					return "unauthorized: user didn't win the auction";
				case 4:
					return "user already minted";
				case 10:
					return "tx provided wrong auction contract for verification";
				default:
					return "unknown";
			}
		},
		"An error occurred during minting",
	);
}

export function formatSuiRefundErr(error: unknown): string {
	// ENotFinalized = 4, ENoBidFound = 6, EInsufficientBidForWinner = 14, EPaused = 15
	return formatSuiErr(
		error,
		(errCode: number) => {
			switch (errCode) {
				case 4:
					return "auction not finalized yet";
				case 6:
					return "no bid found for this address";
				case 14:
					return "insufficient bid amount for winner";
				case 15:
					return "auction is paused";
				default:
					return "unknown";
			}
		},
		"An error occurred during refund",
	);
}

async function queryHasMinted(addr: string, client: SuiClient, cfg: BeelieversMintCfg): Promise<boolean> {
	try {
		const txb = new Transaction();
		txb.moveCall({
			target: `${cfg.pkgId}::mint::has_minted`,
			arguments: [txb.object(cfg.collectionId), txb.pure.address(addr)],
		});

		const result = await client.devInspectTransactionBlock({
			sender: addr,
			transactionBlock: txb,
		});

		return result.results?.[0]?.returnValues?.[0]?.[0]?.[0] === 1;
	} catch (error) {
		logError({ msg: "Error checking mint status", method: "MintInfo:queryHasMinted" }, error);
		return false;
	}
}
