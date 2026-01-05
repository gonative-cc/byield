import { useState, useEffect, useRef, useCallback } from "react";
import {
	useSuiClientContext,
	useCurrentAccount,
	useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { KioskClient, Network, KioskTransaction } from "@mysten/kiosk";
import { fetchNftMetadata } from "~/pages/BeelieversAuction/nft";
import { logError } from "~/lib/log";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";

type NftMetadata = NonNullable<Awaited<ReturnType<typeof fetchNftMetadata>>>;

export interface NftWithKiosk extends NftMetadata {
	isInKiosk: boolean;
	kioskId?: string;
	kioskCapId?: string;
	actualType?: string;
}

async function getKioskNFTs(
	userAddress: string,
	kioskClient: KioskClient,
	nftType: string,
): Promise<Map<string, { kioskId: string; kioskCapId: string }>> {
	const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ address: userAddress });
	const kioskMap = new Map<string, { kioskId: string; kioskCapId: string }>();

	for (let i = 0; i < kioskOwnerCaps.length; i += 10) {
		const batch = kioskOwnerCaps.slice(i, i + 10);
		const results = await Promise.allSettled(
			batch.map((cap) =>
				kioskClient.getKiosk({
					id: cap.kioskId,
					options: { withKioskFields: false, withListingPrices: false },
				}),
			),
		);

		results.forEach((result, idx) => {
			if (result.status === "fulfilled") {
				result.value.items
					.filter((item) => item.type === nftType)
					.forEach((item) => {
						kioskMap.set(item.objectId, {
							kioskId: batch[idx].kioskId,
							kioskCapId: batch[idx].objectId,
						});
					});
			}
		});

		if (i + 10 < kioskOwnerCaps.length) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	return kioskMap;
}

function moveCallTarget(pkgId: string): string {
	return `${pkgId}::mint::upsert_nft_badges`;
}

export function useYourBeelievers() {
	const { client, network } = useSuiClientContext();
	const currentAccount = useCurrentAccount();
	const addr = currentAccount?.address;
	const { beelieversMint } = useNetworkVariables();
	const [nfts, setNfts] = useState<NftWithKiosk[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const lastAddr = useRef<string | null>(null);
	const lastNetwork = useRef<string | null>(null);

	const fetchNFTs = useCallback(
		async (force = false, silent = false) => {
			if (!addr || !client || !beelieversMint.pkgId) {
				setNfts([]);
				lastAddr.current = null;
				return;
			}

			if (!force && addr === lastAddr.current && network === lastNetwork.current) return;

			lastAddr.current = addr;
			lastNetwork.current = network;
			if (!silent) setIsLoading(true);

			try {
				const nftType = `${beelieversMint.pkgId}::mint::BeelieverNFT`;
				const kioskClient = new KioskClient({ client, network: network as Network });
				const kioskMap = await getKioskNFTs(addr, kioskClient, nftType);

				// TODO: Remove .slice(0, 10) limit before deployment - for testing only
				const nftIds = Array.from(kioskMap.keys()).slice(0, 10);
				const data: NftWithKiosk[] = [];
				const BATCH_SIZE = 10;

				for (let i = 0; i < nftIds.length; i += BATCH_SIZE) {
					const batch = nftIds.slice(i, i + BATCH_SIZE);
					const batchResults = await Promise.all(
						batch.map(async (id) => {
							const [metadata, obj] = await Promise.all([
								fetchNftMetadata(client, id),
								client.getObject({ id, options: { showType: true } }),
							]);

							if (!metadata) return null;

							const kiosk = kioskMap.get(id);
							const nftData: NftWithKiosk = {
								...metadata,
								actualType: obj.data?.type || nftType,
								isInKiosk: !!kiosk,
								kioskId: kiosk?.kioskId,
								kioskCapId: kiosk?.kioskCapId,
							};
							return nftData;
						}),
					);

					data.push(...(batchResults.filter((nft) => nft !== null) as NftWithKiosk[]));

					if (i + BATCH_SIZE < nftIds.length) {
						await new Promise((resolve) => setTimeout(resolve, 500));
					}
				}

				setNfts(data);
			} catch (error) {
				logError({ msg: "NFT fetch failed", method: "useYourBeelievers" }, error);
				setNfts([]);
			} finally {
				if (!silent) setIsLoading(false);
			}
		},
		[addr, client, beelieversMint.pkgId, network],
	);

	useEffect(() => {
		fetchNFTs();
	}, [fetchNFTs]);

	const updateBadges = useCallback((nftId: string, badges: string[]) => {
		setNfts((prev) => prev.map((nft) => (nft.id === nftId ? { ...nft, badges } : nft)));
	}, []);

	return {
		nfts,
		isLoading,
		userAddress: addr,
		refetch: () => fetchNFTs(true, true),
		updateBadges,
	};
}

export function useClaimBadges({
	nftId,
	collectionId,
	pkgId,
	isInKiosk,
	kioskId,
	kioskCapId,
	actualType,
	addr,
	currentBadges,
	onSuccess,
}: {
	nftId: string;
	collectionId: string;
	pkgId: string;
	isInKiosk: boolean;
	kioskId?: string;
	kioskCapId?: string;
	actualType: string;
	addr: string;
	currentBadges: string[];
	onSuccess?: (badges: string[]) => void;
}) {
	const { mutate: signAndExecTx, isPending } = useSignAndExecuteTransaction();
	const { client, network } = useSuiClientContext();

	const claim = async () => {
		const tx = new Transaction();

		if (isInKiosk && kioskId && kioskCapId) {
			try {
				const kioskClient = new KioskClient({ client, network: network as Network });
				const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ address: addr });
				const cap = kioskOwnerCaps.find((k) => k.kioskId === kioskId);

				if (!cap) {
					toast({ title: "Kiosk cap not found", variant: "destructive" });
					return;
				}

				const kioskTx = new KioskTransaction({ transaction: tx, kioskClient, cap });
				kioskTx
					.borrowTx({ itemId: nftId, itemType: actualType }, (item) => {
						tx.moveCall({
							target: moveCallTarget(pkgId),
							arguments: [tx.object(collectionId), item],
						});
					})
					.finalize();
			} catch (err) {
				logError({ msg: "kiosk tx failed", method: "useClaimBadges" }, err);
				toast({ title: "Transaction setup failed", variant: "destructive" });
				return;
			}
		} else {
			tx.moveCall({
				target: moveCallTarget(pkgId),
				arguments: [tx.object(collectionId), tx.object(nftId)],
			});
		}

		toast({ title: "Claiming badges", variant: "info" });
		signAndExecTx(
			{ transaction: tx },
			{
				onSuccess: async () => {
					await new Promise((r) => setTimeout(r, 1000));
					const meta = await fetchNftMetadata(client, nftId);
					const badges = meta?.badges || [];

					if (badges.length > currentBadges.length) {
						const n = badges.length - currentBadges.length;
						toast({ title: `${n} new badge${n > 1 ? "s" : ""}`, variant: "default" });
					} else {
						toast({ title: "No new badges", variant: "info" });
					}
					onSuccess?.(badges);
				},
				onError: (err: unknown) => {
					logError({ msg: "claim failed", method: "useClaimBadges" }, err);
					toast({ title: "Claim failed", variant: "destructive" });
				},
			},
		);
	};

	return { claim, isPending };
}
