import { useState } from "react";
import { heroTitle, GRADIENTS } from "~/util/tailwind";
import { SuiConnectModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { useNetworkVariables } from "~/networkConfig";
import { mkWalrusImageUrl } from "~/lib/suienv";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { getAttributeValue, formatBeelieverName } from "~/pages/BeelieversAuction/nft";
import { useYourBeelievers, useClaimBadges, type NftWithKiosk } from "./useYourBeelievers";
import { NftBadgesModal } from "./NftBadgesModal";

export function YourBeelievers() {
	const { nfts, isLoading, userAddress, updateBadges } = useYourBeelievers();

	return (
		<div className="flex w-full flex-col items-center gap-6 sm:gap-8 lg:gap-10">
			<h1 className={heroTitle + " text-primary-foreground"}>🐝 Your Beelievers</h1>

			{!userAddress ? (
				<div className="flex w-full flex-col items-center gap-4">
					<p className="text-base-content/75 text-lg">
						Connect your wallet to view your Beelievers NFTs
					</p>
					<SuiConnectModal />
				</div>
			) : isLoading ? (
				<div className="flex w-full flex-col items-center gap-4">
					<p className="text-base-content/75 text-lg">Loading your NFTs...</p>
					<LoadingSpinner isLoading={true} />
				</div>
			) : nfts.length === 0 ? (
				<div className="flex w-full flex-col items-center gap-4">
					<p className="text-base-content/75 text-lg">You don&apos;t own any Beelievers NFTs yet</p>
					<a
						href="https://www.tradeport.xyz/sui/collection/beelievers"
						target="_blank"
						rel="noreferrer"
						className="link link-primary"
					>
						Learn more about Beelievers
					</a>
				</div>
			) : (
				<div className="w-full">
					<div className="mb-6 text-center">
						<p className="text-primary text-2xl font-bold">
							You own {nfts.length} Beeliever{nfts.length > 1 ? "s" : ""}
						</p>
					</div>
					<div className="flex w-full justify-center">
						<div
							className={`${GRADIENTS.primaryNftBg} card card-border w-full border shadow-2xl md:w-3/4`}
						>
							<div className="card-body p-4 lg:p-8">
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{nfts.map((nft) => (
										<NFTCard
											key={nft.id}
											nft={nft}
											userAddress={userAddress}
											onClaimSuccess={(badges) => updateBadges(nft.id, badges)}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function NFTCard({
	nft,
	userAddress,
	onClaimSuccess,
}: {
	nft: NftWithKiosk;
	userAddress: string;
	onClaimSuccess: (badges: string[]) => void;
}) {
	const { beelieversMint } = useNetworkVariables();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const modalId = `nft-badges-${nft.id}`;
	const { claim, isPending } = useClaimBadges({
		nftId: nft.id,
		collectionId: beelieversMint.collectionId,
		pkgId: beelieversMint.pkgId,
		isInKiosk: nft.isInKiosk,
		kioskId: nft.kioskId,
		kioskCapId: nft.kioskCapId,
		actualType: nft.actualType || `${beelieversMint.pkgId}::mint::BeelieverNFT`,
		addr: userAddress,
		currentBadges: nft.badges || [],
		onSuccess: onClaimSuccess,
	});

	const imageUrl = mkWalrusImageUrl(nft.image_id);
	const type = getAttributeValue(nft.attributes, "Type");
	const mythicName = getAttributeValue(nft.attributes, "Mythic Name");
	const name = formatBeelieverName(type, mythicName, nft.name);

	return (
		<>
			<div className="card hover:bg-base-300 transition-colors">
				<button className="w-full text-left" onClick={() => setIsModalOpen(true)} type="button">
					<figure className="aspect-square">
						{imageUrl ? (
							<img src={imageUrl} alt={nft.name} className="h-full w-full object-cover" />
						) : (
							<div
								className={`${GRADIENTS.primaryNft} flex h-full w-full items-center justify-center text-6xl`}
							>
								🐝
							</div>
						)}
					</figure>
					<div className="card-body gap-2 p-4">
						<h3 className="card-title text-primary text-lg">{name}</h3>
						<p className="text-base-content/75 text-sm">Beeliever #{nft.token_id}</p>
						<p className="text-base-content/75 truncate text-xs">ID: {trimAddress(nft.id)}</p>
					</div>
				</button>
				<div className="card-body gap-2 p-4 pt-0">
					<div className="card-actions">
						<button
							onClick={claim}
							disabled={isPending}
							className="btn btn-primary btn-sm w-full"
							type="button"
						>
							{isPending ? "Claiming..." : "Claim Badges"}
						</button>
					</div>
				</div>
			</div>
			<NftBadgesModal
				id={modalId}
				badges={nft.badges || []}
				nftName={name}
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
}
