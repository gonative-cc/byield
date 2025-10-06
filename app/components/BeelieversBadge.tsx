import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useFetcher } from "react-router";
import type { CheckNftOwnershipResp } from "~/server/BeelieversAuction/jsonrpc";

export function BeelieversBadge() {
	const [ownsNft, setOwnsNft] = useState(false);
	const account = useCurrentAccount();
	const { network } = useSuiClientContext();
	const ownershipFetcher = useFetcher<CheckNftOwnershipResp>({ key: "nft-check" });
	const lastFetchKeyRef = useRef<string | null>(null);

	const accountNetworkKey = account?.address ? `${account.address}-${network}` : null;
	const needsOwnershipCheck =
		accountNetworkKey &&
		accountNetworkKey !== lastFetchKeyRef.current &&
		ownershipFetcher.state === "idle";

	if (needsOwnershipCheck && account?.address) {
		lastFetchKeyRef.current = accountNetworkKey;
		ownershipFetcher.submit(
			{ method: "checkNftOwnership", params: [account.address, network] },
			{ method: "POST", encType: "application/json", action: "/beelievers-auction" },
		);
	}

	useEffect(() => {
		setOwnsNft(
			account?.address && ownershipFetcher.data
				? (ownershipFetcher.data as CheckNftOwnershipResp).ownsNft
				: false,
		);
	}, [account?.address, ownershipFetcher.data]);

	return ownsNft ? (
		<div className="badge badge-primary badge-sm gap-1">
			<img src="/assets/ui-icons/beelievers-badge2.svg" alt="Beeliever" className="h-4 w-4" />
			Beeliever
		</div>
	) : null;
}
