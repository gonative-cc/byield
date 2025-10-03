import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { KioskClient, Network } from "@mysten/kiosk";
import { queryNftFromKiosk, queryNftByModule } from "~/pages/BeelieversAuction/nft";

export function BeelieversBadge() {
	const [ownsNft, setOwnsNft] = useState(false);
	const account = useCurrentAccount();
	const { client, network } = useSuiClientContext();
	const { beelieversMint } = useNetworkVariables();

	useEffect(() => {
		async function checkNftOwnership() {
			if (!account?.address || !beelieversMint.pkgId) {
				setOwnsNft(false);
				return;
			}

			try {
				// Check direct ownership first
				const directNft = await queryNftByModule(account.address, client, beelieversMint.pkgId);
				if (directNft) {
					setOwnsNft(true);
					return;
				}

				// Query all kiosks owned by user on-chain
				const kioskClient = new KioskClient({ client, network: network as Network });
				const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ address: account.address });

				// Check each kiosk for Beelievers NFTs
				if (kioskOwnerCaps && kioskOwnerCaps.length > 0) {
					for (const kiosk of kioskOwnerCaps) {
						const nftInKiosk = await queryNftFromKiosk(
							kiosk.kioskId,
							beelieversMint.pkgId,
							client,
						);
						if (nftInKiosk) {
							setOwnsNft(true);
							return;
						}
					}
				}

				setOwnsNft(false);
			} catch (error) {
				console.error("Error checking NFT ownership:", error);
				setOwnsNft(false);
			}
		}

		checkNftOwnership();
	}, [account?.address, client, beelieversMint, network]);

	if (!ownsNft) {
		return null;
	}

	return (
		<div className="badge badge-primary badge-sm gap-1">
			<img src="/assets/ui-icons/beelievers-badge2.svg" alt="Beeliever" className="h-4 w-4" />
			Beeliever
		</div>
	);
}
