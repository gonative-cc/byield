import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useFetcher } from "react-router";
import type { CheckNftOwnershipResp } from "~/server/BeelieversAuction/jsonrpc";

export function BeelieversBadge() {
	const [ownsNft, setOwnsNft] = useState(false);
	const account = useCurrentAccount();
	const { network } = useSuiClientContext();
	const fetcher = useFetcher<CheckNftOwnershipResp>({ key: "nft-check" });
	const lastRequestRef = useRef<string | null>(null);

	const currentKey = account?.address ? `${account.address}-${network}` : null;
	const shouldFetch = currentKey && currentKey !== lastRequestRef.current && fetcher.state === "idle";

	if (shouldFetch && account?.address) {
		lastRequestRef.current = currentKey;
		fetcher.submit(
			{ method: "checkNftOwnership", params: [account.address, network] },
			{ method: "POST", encType: "application/json", action: "/beelievers-auction" },
		);
	}

	useEffect(() => {
		setOwnsNft(
			account?.address && fetcher.data ? (fetcher.data as CheckNftOwnershipResp).ownsNft : false,
		);
	}, [account?.address, fetcher.data]);

	return ownsNft ? (
		<div className="badge badge-primary badge-sm gap-1">
			<img src="/assets/ui-icons/beelievers-badge2.svg" alt="Beeliever" className="h-4 w-4" />
			Beeliever
		</div>
	) : null;
}
