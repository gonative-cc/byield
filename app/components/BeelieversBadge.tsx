import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { Network } from "@mysten/kiosk";
import { initializeKioskInfo } from "~/pages/BeelieversAuction/kiosk";
import { findExistingNft } from "~/pages/BeelieversAuction/nft";

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
				const kioskInfo = await initializeKioskInfo(account.address, client, network as Network);
				const nftId = await findExistingNft(
					account.address,
					client,
					beelieversMint.pkgId,
					kioskInfo?.kioskId,
				);

				setOwnsNft(!!nftId);
			} catch {
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
			<img src="/assets/ui-icons/beelievers-badge2.svg" alt="Beeliever" className="w-4 h-4" />
			Beeliever
		</div>
	);
}
