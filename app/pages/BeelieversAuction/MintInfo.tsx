import { Transaction } from "@mysten/sui/transactions";
import {
	useSignAndExecuteTransaction,
	useSuiClientContext,
	useCurrentAccount,
	useSignTransaction,
} from "@mysten/dapp-kit";
import { useState, useEffect, useCallback } from "react";
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
import { parseTxError } from "~/lib/suierr";

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
	hasMinted: boolean;
}

function MintAction({ isWinner, doRefund, hasMinted }: MintActionProps) {
	const { beelieversAuction, beelieversMint } = useNetworkVariables();
	const { mutate: signAndExecTx, isPending: isRefundPending } = useSignAndExecuteTransaction();
	const { mutateAsync: signTransaction } = useSignTransaction();
	const { network, client } = useSuiClientContext();
	const account = useCurrentAccount();

	const signAndExecuteTransaction = async (transaction: Transaction) => {
		const chain = account?.chains?.[0];
		const { bytes, signature } = await signTransaction({
			transaction,
			chain,
		});
		console.log("chain", chain);

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
		isPersonal?: boolean;
	} | null>(null);

	const [isMinting, setIsMinting] = useState(false);

	const kioskClient = new KioskClient({
		client: client,
		network: network,
	});

	const storeKioskInfo = (address: string, kioskId: string, kioskCapId: string) => {
		const kioskData = {
			kioskId,
			kioskCapId,
			address,
			isPersonal: false,
		};
		localStorage.setItem(`kioskInfo-${address}`, JSON.stringify(kioskData));
		setKioskInfo(kioskData);
	};

	const getStoredKioskInfo = (address: string) => {
		const storedData = localStorage.getItem(`kioskInfo-${address}`);
		if (storedData) {
			const parsedData = JSON.parse(storedData);
			if (parsedData.address === address) {
				return parsedData;
			}
		}
		return null;
	};
	const verifyKiosk = async (kioskId: string, kioskCapId: string) => {
		try {
			const kioskObject = await client.getObject({
				id: kioskId,
				options: { showContent: true },
			});
			const capObject = await client.getObject({
				id: kioskCapId,
				options: { showContent: true },
			});
			return kioskObject.data && capObject.data;
		} catch (error) {
			console.error("Error verifying kiosk:", error);
			return false;
		}
	};
	useEffect(() => {
		const initializeKioskInfo = async () => {
			if (!account) return;
			const stored = getStoredKioskInfo(account.address);
			if (stored) {
				const isValid = await verifyKiosk(stored.kioskId, stored.kioskCapId);
				if (isValid) {
					setKioskInfo(stored);
					return;
				} else {
					localStorage.removeItem(`kioskInfo-${account.address}`);
				}
			}
			try {
				const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ address: account.address });

				if (kioskOwnerCaps && kioskOwnerCaps.length > 0) {
					const nonPersonalKiosk = kioskOwnerCaps.find((kiosk) => !kiosk.isPersonal);

					if (nonPersonalKiosk) {
						storeKioskInfo(account.address, nonPersonalKiosk.kioskId, nonPersonalKiosk.objectId);
					}
				}
			} catch (error) {
				console.error("Error fetching kiosks from network:", error);
			}
		};

		initializeKioskInfo();
	}, [account]);

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

				const kioskTx = createKioskTx(client, account.address, network);
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

				storeKioskInfo(account.address, kioskId, kioskCapId);
			} else {
				kioskId = kioskInfo.kioskId;
				kioskCapId = kioskInfo.kioskCapId;
			}

			toast({ title: "Minting NFT", variant: "info" });

			const tx = createMintTx(kioskId, kioskCapId, beelieversMint, beelieversAuction.auctionId);
			const result = await signAndExecuteTransaction(tx);
			console.log(">>> mint result", result.digest, result.errors);

			toast({
				title: "Minting Successful",
				description: "Successfully minted Beeliever NFT",
			});
		} catch (error) {
			console.error("Error minting:", error);

			let msg = "An error occurred during minting";
			const maybeErr = (error as Error).message;
			if (maybeErr) msg = formatSuiErr(maybeErr);
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
			{hasMinted && (
				<div className="flex-1 text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
					<span className="text-primary font-semibold">✅ Already Minted</span>
				</div>
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

	// Check if user has already minted
	const checkHasMinted = useCallback(async () => {
		if (!account || !beelieversMint.packageId) return;

		try {
			const txb = new Transaction();
			txb.moveCall({
				target: `${beelieversMint.packageId}::mint::has_minted_public`,
				arguments: [txb.object(beelieversMint.collectionId), txb.pure.address(account.address)],
			});

			const result = await client.devInspectTransactionBlock({
				sender: account.address,
				transactionBlock: txb,
			});

			const hasAlreadyMinted = result.results?.[0]?.returnValues?.[0]?.[0]?.[0] === 1;
			setHasMinted(hasAlreadyMinted);
		} catch (error) {
			console.error("Error checking mint status:", error);
			setHasMinted(false);
		}
	}, [account, client, beelieversMint]);

	useEffect(() => {
		if (account) {
			checkHasMinted();
		}
	}, [account, checkHasMinted]);

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
							/>
							<MintInfoItem
								title="Mint Status:"
								value={hasMinted ? "✅ Already Minted" : "⏳ Not Minted"}
								isLastItem
							/>
						</div>
					</div>
					<MintAction isWinner={isWinner} doRefund={doRefund} hasMinted={hasMinted} />
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

// TODO: move to app/lib/suienv.ts

function createMintTx(kioskId: string, kioskCapId: string, mintCfg: MintCfg, auctionId: string): Transaction {
	const tx = new Transaction();

	// We need a payment coin even if mint_price is 0 (it will be destroyed)
	const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(1)]); // Use 1 MIST

	tx.moveCall({
		target: `${mintCfg.packageId}::mint::mint`,
		arguments: [
			tx.object(mintCfg.collectionId),
			paymentCoin,
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

function createKioskTx(client: SuiClient, userAddr: string, network: Network): Transaction {
	const kioskClient = new KioskClient({
		client: client,
		network: network,
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

export function formatSuiErr(err: string): string {
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
