import { useEffect, useMemo, useRef } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useFetcher } from "react-router";
import type { CheckNftOwnershipResp } from "~/server/BeelieversAuction/jsonrpc";

export function BeelieversBadge() {
	const account = useCurrentAccount();
	const { network } = useSuiClientContext();
	const fetcher = useFetcher<CheckNftOwnershipResp>();
	const hasSubmitted = useRef(false);

	const cacheKey = account?.address ? mkCacheKey(account.address, network) : null;
	const cachedResult = useMemo(() => (cacheKey ? getCachedOwnership(cacheKey) : null), [cacheKey]);

	useEffect(() => {
		if (!account?.address || cachedResult !== null || hasSubmitted.current) return;

		hasSubmitted.current = true;
		fetcher.submit(
			{
				method: "checkNftOwnership",
				params: [account.address, network],
			},
			{
				method: "POST",
				action: "/beelievers-auction",
				encType: "application/json",
			},
		);
	}, [account?.address, network, cachedResult, fetcher]);

	useEffect(() => {
		if (account?.address) {
			hasSubmitted.current = false;
		}
	}, [account?.address, network]);

	useEffect(() => {
		if (fetcher.data !== undefined && account?.address && cacheKey) {
			setCachedOwnership(cacheKey, fetcher.data);
		}
	}, [fetcher.data, account?.address, cacheKey]);

	const ownsNft = fetcher.data !== undefined ? fetcher.data : cachedResult;

	return ownsNft ? (
		<div className="badge badge-accent">
			<img src="/assets/ui-icons/beelievers-badge2.svg" alt="Beeliever" className="h-4 w-4" />
			Beeliever
		</div>
	) : null;
}

function mkCacheKey(address: string, network: string): string {
	return `beelievers_nft_${address}_${network}`;
}

function getCachedOwnership(cacheKey: string): boolean | null {
	const cached = localStorage.getItem(cacheKey);
	if (!cached) return null;

	const { ownsNft, timestamp } = JSON.parse(cached) as { ownsNft: boolean; timestamp: number };
	if (Date.now() - timestamp < 60 * 60 * 1000) {
		return ownsNft;
	}

	localStorage.removeItem(cacheKey);
	return null;
}

function setCachedOwnership(cacheKey: string, ownsNft: boolean): void {
	localStorage.setItem(cacheKey, JSON.stringify({ ownsNft, timestamp: Date.now() }));
}
