import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import type { SuiClient } from "@mysten/sui/client";
import { useNetworkVariables } from "~/networkConfig";
import { KioskClient, Network } from "@mysten/kiosk";
import { queryNftFromKiosk, queryNftByModule } from "~/pages/BeelieversAuction/nft";

export function BeelieversBadge() {
	const [ownsNft, setOwnsNft] = useState(false);
	const account = useCurrentAccount();
	const { network, client } = useSuiClientContext();
	const { beelieversMint } = useNetworkVariables();

	useEffect(() => {
		if (!account?.address) {
			setOwnsNft(false);
			return;
		}

		const checkNftOwnership = async () => {
			const cacheKey = `beelievers_nft_${account.address}_${network}`;

			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				const { ownsNft: cachedResult, timestamp } = JSON.parse(cached);
				if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
					setOwnsNft(cachedResult);
					return;
				}
				localStorage.removeItem(cacheKey);
			}

			try {
				const directNft = await queryNftByModule(
					account.address,
					client as unknown as SuiClient,
					beelieversMint.pkgId,
				);
				if (directNft) {
					localStorage.setItem(cacheKey, JSON.stringify({ ownsNft: true, timestamp: Date.now() }));
					setOwnsNft(true);
					return;
				}
				const kioskClient = new KioskClient({
					client: client as unknown as SuiClient,
					network: network as Network,
				});
				const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ address: account.address });

				if (kioskOwnerCaps && kioskOwnerCaps.length > 0) {
					for (const kiosk of kioskOwnerCaps) {
						const nftInKiosk = await queryNftFromKiosk(
							kiosk.kioskId,
							beelieversMint.pkgId,
							client as unknown as SuiClient,
						);
						if (nftInKiosk) {
							localStorage.setItem(
								cacheKey,
								JSON.stringify({ ownsNft: true, timestamp: Date.now() }),
							);
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
		};

		checkNftOwnership();
	}, [account?.address, network, client, beelieversMint.pkgId]);

	return ownsNft ? (
		<div className="badge badge-primary badge-sm gap-1">
			<img src="/assets/ui-icons/beelievers-badge2.svg" alt="Beeliever" className="h-4 w-4" />
			Beeliever
		</div>
	) : null;
}
