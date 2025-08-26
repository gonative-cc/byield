import { useCallback, useEffect, useState } from "react";
import { useCurrentWallet, useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { KioskClient, Network, KioskTransaction } from "@mysten/kiosk";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { SuiModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { toast } from "~/hooks/use-toast";
import { LoaderCircle } from "lucide-react";

//mainnet
const PACKAGE_ID = "";
const COLLECTION_OBJECT_ID = "";
const TRANSFER_POLICY_ID = "";
const AUCTION_PACKAGE = "0xff4982cd449809676699d1a52c5562fc15b9b92cb41bde5f8845a14647186704";
const AUCTION_OBJECT_ID = "0x161524be15687cca96dec58146568622458905c30479452351f231cac5d64c41";
const RANDOM_ID = "0x8";
const _ADMIN_CAP = "";
const MINT_START_TIME = 1755975600000;

//testnet
//const PACKAGE_ID = "0xada75092e6cecd4ddb31c328b31e6d5beea6860068e9ba32fe27560027faaa2f";
//const _ADMIN_CAP = "0xce8c355459dd0f44117608f4a282ab63c70dcba10ca596265e473353bdee435a";
//const AUCTION_PACKAGE = "0xbad048cf3c9ef2f17ced6c6d03f86c5721fde22093e5a27a8c9c77acbd3be0c3";
//const COLLECTION_OBJECT_ID = "0xa1d6b6eb06c27186ebb193704896d5f706e0437f11779483feb81658759df0d6";
//const TRANSFER_POLICY_ID = "0x9f963968ec33326fd4de2f86e64538e63013f7f4120c1553cb2dc9f0ed9917c6";
//const AUCTION_OBJECT_ID = "0x345c10a69dab4ba85be56067c94c4a626c51e297b884e43b113d3eb99ed7a0f3";
//const RANDOM_ID = "0x8";

const TOTAL_SUPPLY = 6021;
const _MYTHIC_SUPPLY = 21;
const _NORMAL_SUPPLY = 6000;
const _MINT_PRICE = 0;

const DEBUG_MODE = false;

const _DEBUG_START_DELAY = 10000;
const DEBUG_START_TIME = 1755975600000;

const _MOCK_COLLECTION_STATE = {
	total_minted: 0,
	mythic_minted: 0,
	normal_minted: 0,
	mint_start: DEBUG_START_TIME,
	minting_active: false,
};

interface MyMintStatusProps {
	isEligible: boolean;
	hasMinted: boolean;
	isPartner: boolean;
	isAuctionWinner: boolean;
}

function MyMintStatus({ isEligible, hasMinted, isPartner }: MyMintStatusProps) {
	return (
		<Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 animate-in slide-in-from-top-2 duration-500">
			<CardContent className="p-4 lg:p-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
							<span className="text-xl">🐝</span>
						</div>
						<div>
							<h3 className="font-semibold text-primary">Your Mint Status</h3>
							<p className="text-sm text-muted-foreground">
								{hasMinted
									? "NFT already minted"
									: isEligible
										? `${isPartner ? "Partner" : "Auction Winner"} - Eligible to mint`
										: "Not eligible for minting"}
							</p>
						</div>
					</div>
					{hasMinted && (
						<div className="text-right">
							<p className="text-2xl font-bold text-primary">✅ Minted</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function BeelieversMintFunction() {
	const { connectionStatus } = useCurrentWallet();
	const { mutateAsync: signTransaction } = useSignTransaction();
	const client = useSuiClient();
	const account = useCurrentAccount();

	const [collectionState, setCollectionState] = useState({
		total_minted: 0,
		mythic_minted: 0,
		normal_minted: 0,
		mint_start: DEBUG_MODE ? DEBUG_START_TIME : MINT_START_TIME,
		minting_active: false,
	});

	const [mintingPhase, setMintingPhase] = useState(0);
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [isMinting, setIsMinting] = useState(false);

	const [kioskInfo, setKioskInfo] = useState<{
		kioskId: string;
		kioskCapId: string;
		address: string;
		isPersonal?: boolean;
	} | null>(null);

	const [isPartner, setIsPartner] = useState(false);
	const [isAuctionWinner, setIsAuctionWinner] = useState(false);
	const [hasMinted, setHasMinted] = useState(false);
	const [isEligible, setIsEligible] = useState(false);
	const [isLoadingEligibility, setIsLoadingEligibility] = useState(false);

	const [_isAdmin, setIsAdmin] = useState(false);

	const kioskClient = new KioskClient({
		client,
		network: Network.MAINNET,
	});

	useEffect(() => {
		const currentTime = Date.now();

		if (!DEBUG_MODE) {
			if (currentTime < collectionState.mint_start) {
				setMintingPhase(0);
			} else {
				setMintingPhase(1);
			}
		}
	}, [collectionState.mint_start]);

	// Update timer effect
	useEffect(() => {
		const timerInterval = setInterval(() => {
			const currentTime = Date.now();

			if (currentTime < collectionState.mint_start) {
				setTimeRemaining(collectionState.mint_start - currentTime);
				setMintingPhase(0);
			} else {
				setTimeRemaining(0);
				setMintingPhase(1);
			}
		}, 1000);

		return () => clearInterval(timerInterval);
	}, [collectionState.mint_start]);

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
			if (account) {
				const stored = getStoredKioskInfo(account.address);
				if (stored) {
					const isValid = await verifyKiosk(stored.kioskId, stored.kioskCapId);
					if (isValid) {
						setKioskInfo(stored);
					} else {
						localStorage.removeItem(`kioskInfo-${account.address}`);
					}
				}
				try {
					const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ address: account.address });

					if (kioskOwnerCaps && kioskOwnerCaps.length > 0) {
						// Find a non-personal kiosk
						const nonPersonalKiosk = kioskOwnerCaps.find((kiosk) => !kiosk.isPersonal);

						if (nonPersonalKiosk) {
							const kioskData = {
								kioskId: nonPersonalKiosk.kioskId,
								kioskCapId: nonPersonalKiosk.objectId,
								address: account.address,
								isPersonal: false,
							};

							localStorage.setItem(`kioskInfo-${account.address}`, JSON.stringify(kioskData));
							return kioskData;
						}
					}
				} catch (error) {
					console.error("Error fetching kiosks from network:", error);
				}
			}
		};

		initializeKioskInfo();
	}, [account]);

	const fetchCollectionState = useCallback(async () => {
		if (!DEBUG_MODE) {
			try {
				const collectionObject = await client.getObject({
					id: COLLECTION_OBJECT_ID,
					options: { showContent: true },
				});

				if (collectionObject.data?.content && "fields" in collectionObject.data.content) {
					const content = collectionObject.data.content.fields as {
						total_minted: number;
						mythic_minted: number;
						normal_minted: number;
						mint_start_time: number;
						minting_active: boolean;
					};
					console.log(content);
					setCollectionState({
						total_minted: content.total_minted,
						mythic_minted: content.mythic_minted,
						normal_minted: content.normal_minted,
						mint_start: content.mint_start_time,
						minting_active: content.minting_active,
					});
				}
			} catch (error) {
				console.error("Error fetching collection state:", error);
				toast({
					title: "Error",
					description: "Failed to fetch collection state",
					variant: "destructive",
				});
			}
		}
	}, [client]);

	const fetchUserEligibility = async () => {
		if (!DEBUG_MODE && account) {
			setIsLoadingEligibility(true);

			try {
				const txb = new Transaction();
				txb.moveCall({
					target: `${PACKAGE_ID}::mint::is_partner_public`,
					arguments: [txb.object(COLLECTION_OBJECT_ID), txb.pure.address(account.address)],
				});

				const partnerResult = await client.devInspectTransactionBlock({
					sender: account.address,
					transactionBlock: txb,
				});
				console.log(partnerResult);

				const txb2 = new Transaction();
				txb2.moveCall({
					target: `${PACKAGE_ID}::mint::has_minted_public`,
					arguments: [txb2.object(COLLECTION_OBJECT_ID), txb2.pure.address(account.address)],
				});

				const mintedResult = await client.devInspectTransactionBlock({
					sender: account.address,
					transactionBlock: txb2,
				});

				console.log(mintedResult);

				const txb3 = new Transaction();
				txb3.moveCall({
					target: `${AUCTION_PACKAGE}::auction::is_winner`,
					arguments: [txb3.object(AUCTION_OBJECT_ID), txb3.pure.address(account.address)],
				});

				const winnerResult = await client.devInspectTransactionBlock({
					sender: account.address,
					transactionBlock: txb3,
				});

				console.log(winnerResult);

				const isPartner = partnerResult.results?.[0]?.returnValues?.[0]?.[0]?.[0] === 1;
				const hasMinted = mintedResult.results?.[0]?.returnValues?.[0]?.[0]?.[0] === 1;
				const isWinner = winnerResult.results?.[0]?.returnValues?.[0]?.[0]?.[0] === 1;

				setIsPartner(isPartner);
				setHasMinted(hasMinted);
				setIsAuctionWinner(isWinner);
				setIsEligible((isPartner || isWinner) && !hasMinted);
			} catch (error) {
				console.error("Error fetching user eligibility:", error);
				setIsPartner(false);
				setHasMinted(false);
				setIsAuctionWinner(false);
				setIsEligible(false);

				toast({
					title: "Error",
					description: "Failed to fetch user eligibility",
					variant: "destructive",
				});
			} finally {
				setIsLoadingEligibility(false);
			}
		}
	};

	useEffect(() => {
		if (account) {
			fetchCollectionState();
			fetchUserEligibility();
		}
	}, [DEBUG_MODE, account]);

	useEffect(() => {
		if (!DEBUG_MODE) {
			fetchCollectionState();

			const interval = setInterval(() => {
				fetchCollectionState();
			}, 10000);

			return () => clearInterval(interval);
		}
	}, [DEBUG_MODE]);

	const formatTime = (milliseconds: number) => {
		if (milliseconds < 0) return "0d 0h 0m 0s";

		const seconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
	};

	const mintNFT = async () => {
		if (!account) return;

		try {
			setIsMinting(true);

			let kioskId, kioskCapId;

			// Create kiosk if it doesn't exist
			if (!kioskInfo) {
				console.log("Creating kiosk");
				const tx = new Transaction();
				//@ts-expect-error - different mysten sui library version
				const kioskTx = new KioskTransaction({ transaction: tx, kioskClient });

				kioskTx.create();
				kioskTx.shareAndTransferCap(account.address);
				kioskTx.finalize();

				const { bytes, signature } = await signTransaction({
					transaction: tx,
					chain: "sui:mainnet",
				});

				const result = await client.executeTransactionBlock({
					transactionBlock: bytes,
					signature,
					options: {
						showEffects: true,
						showInput: true,
						showRawEffects: true,
					},
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

				storeKioskInfo(account.address, kioskId, kioskCapId); // New kiosks are not personal
				setKioskInfo({ kioskId, kioskCapId, address: account.address, isPersonal: false });
			} else {
				kioskId = kioskInfo.kioskId;
				kioskCapId = kioskInfo.kioskCapId;
			}

			const tx = new Transaction();

			// Create payment coin (0 SUI for free mint)
			const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(0)]);

			tx.moveCall({
				target: `${PACKAGE_ID}::mint::mint`,
				arguments: [
					tx.object(COLLECTION_OBJECT_ID),
					paymentCoin,
					tx.object(TRANSFER_POLICY_ID),
					tx.object(RANDOM_ID),
					tx.object("0x6"), // Clock
					tx.object(AUCTION_OBJECT_ID),
					tx.object(kioskId),
					tx.object(kioskCapId),
				],
			});

			const { bytes, signature } = await signTransaction({
				transaction: tx,
				chain: "sui:mainnet",
			});

			await client.executeTransactionBlock({
				transactionBlock: bytes,
				signature,
				options: { showEffects: true, showInput: true },
			});

			// After successful mint, refresh states
			await new Promise((resolve) => setTimeout(resolve, 5000));
			await Promise.all([fetchCollectionState(), fetchUserEligibility()]);

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

	// Add useEffect to check admin status when account changes
	useEffect(() => {
		if (account) {
			setIsAdmin(account.address === "");
		}
	}, [account]);

	return (
		<div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full relative">
			<div className="flex flex-col items-center gap-4">
				<p className="md:text-3xl text-2xl text-center font-semibold max-w-120">
					<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> NFT Mint
				</p>
			</div>

			{connectionStatus !== "connected" && (
				<div className="animate-in slide-in-from-right-4 duration-1000 delay-500 w-full flex justify-center">
					<Card className="w-full lg:w-2/3 xl:w-1/2 shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300">
						<CardContent className="p-6 lg:p-8 rounded-lg text-white flex flex-col w-full gap-6 bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20">
							<div className="flex items-center justify-center gap-3">
								<div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center">
									<span className="text-2xl">🔗</span>
								</div>
								<div>
									<h2 className="text-2xl lg:text-3xl font-bold text-primary">
										Connect Your Wallet
									</h2>
									<p className="text-sm text-muted-foreground">
										Connect your Sui wallet to check eligibility and mint
									</p>
								</div>
							</div>
							<SuiModal />
						</CardContent>
					</Card>
				</div>
			)}

			{/* Minting Interface - Only visible when connected */}
			{connectionStatus === "connected" && (
				<div className="animate-in slide-in-from-right-4 duration-1000 delay-500 w-full flex justify-center">
					<div className="w-full lg:w-2/3 xl:w-1/2 space-y-6">
						{/* Current Mint Status */}
						{!isLoadingEligibility && (
							<MyMintStatus
								isEligible={isEligible}
								hasMinted={hasMinted}
								isPartner={isPartner}
								isAuctionWinner={isAuctionWinner}
							/>
						)}

						{isLoadingEligibility ? (
							<Card className="shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in slide-in-from-bottom-2 duration-700">
								<CardContent className="p-6 lg:p-8 rounded-lg text-white flex flex-col w-full gap-6 bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20">
									<div className="flex items-center justify-center gap-3">
										<LoaderCircle className="animate-spin w-6 h-6 text-primary" />
										<span className="text-lg font-semibold text-primary">
											Checking mint eligibility...
										</span>
									</div>
								</CardContent>
							</Card>
						) : (
							mintingPhase === 1 &&
							isEligible &&
							!hasMinted && (
								<Card className="shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in slide-in-from-bottom-2 duration-700">
									<CardContent className="p-6 lg:p-8 rounded-lg text-white flex flex-col w-full gap-6 bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center animate-pulse-glow">
													<span className="text-2xl">🐝</span>
												</div>
												<div>
													<h2 className="text-2xl lg:text-3xl font-bold text-primary">
														Mint Your NFT
													</h2>
													<p className="text-sm text-muted-foreground">
														{isPartner
															? "Partner mint available"
															: "Auction winner mint available"}
													</p>
												</div>
											</div>
										</div>

										<div className="flex flex-col w-full space-y-4">
											<div className="space-y-2">
												<div className="text-sm font-medium text-foreground/80">
													<span className="text-lg">🎁 </span>
													Free mint for eligible participants
												</div>
											</div>

											<Button
												onClick={mintNFT}
												disabled={isMinting}
												className="h-14 lg:h-16 text-lg font-semibold bg-gradient-to-r from-primary to-orange-400 hover:from-orange-400 hover:to-primary transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<span className="flex items-center gap-2">
													{isMinting ? (
														<LoaderCircle className="animate-spin w-6 h-6" />
													) : (
														<>
															<span className="text-xl">🚀</span> Mint NFT
														</>
													)}
												</span>
											</Button>
										</div>
									</CardContent>
								</Card>
							)
						)}
					</div>
				</div>
			)}

			{/* Stats Section */}
			<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-300 w-full flex justify-center">
				<Card className="w-full lg:w-[85%] xl:w-[75%] shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300">
					<CardContent className="p-4 lg:p-8 rounded-lg text-white flex flex-col lg:flex-row gap-6 lg:gap-8 bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15">
						<div className="flex-shrink-0 flex justify-center lg:justify-start">
							<div className="animate-float">
								<img
									src="/assets/bee/bee-looking-right.webp"
									alt="bee-looking-right.webp"
									className="hidden lg:block w-auto h-auto"
								/>
								<img
									src="/assets/bee/bee-with-face-only.webp"
									alt="bee-with-face-only"
									className="lg:hidden block w-auto h-auto"
								/>
							</div>
						</div>
						<div className="flex flex-col gap-4 lg:gap-6 py-0 w-full lg:text-base leading-relaxed">
							<div className="flex flex-row justify-between items-center gap-4">
								<div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 font-semibold text-primary">
									<span className="text-2xl">⏰</span>
									{mintingPhase === 0 ? (
										<>
											<span className="text-sm">Minting starts in </span>
											<span className="text-sm font-bold">
												{formatTime(timeRemaining)}
											</span>
										</>
									) : (
										<span className="text">Minting is active</span>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
									<div className="text-2xl font-bold text-primary">
										{collectionState.total_minted}
									</div>
									<div className="text-sm text-muted-foreground">Total Minted</div>
								</div>
								<div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
									<div className="text-2xl font-bold text-primary">
										{collectionState.mythic_minted}
									</div>
									<div className="text-sm text-muted-foreground">Mythic NFTs</div>
								</div>
								<div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
									<div className="text-2xl font-bold text-primary">
										{TOTAL_SUPPLY - collectionState.total_minted}
									</div>
									<div className="text-sm text-muted-foreground">Remaining</div>
								</div>
							</div>

							<p>
								BTCFi Beelievers NFT is a free mint for partners and auction winners. Each
								eligible address can mint one NFT. Partners have a chance to mint rare mythic
								NFTs while auction winners receive normal NFTs.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default function BeelieversMint() {
	return <BeelieversMintFunction />;
}
