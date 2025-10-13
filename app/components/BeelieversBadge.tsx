import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";

export function BeelieversBadge() {
	const [ownsNft, setOwnsNft] = useState(false);
	const account = useCurrentAccount();
	const { network } = useSuiClientContext();
	const { beelieversMint } = useNetworkVariables();

	useEffect(() => {
		const checkNftOwnership = async () => {
			if (!account?.address) {
				setOwnsNft(false);
				return;
			}

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
				const nftType = `${beelieversMint.pkgId}::mint::BeelieverNFT`;
				const graphqlUrl =
					network === "mainnet"
						? "https://graphql.mainnet.sui.io/graphql"
						: "https://graphql.testnet.sui.io/graphql";

				const query = `
					query ($userAddress: String!, $nftType: String!) {
						address(address: $userAddress) {
							objects(filter: { type: $nftType }) {
								nodes { 
									address 
								}
							}
							kioskCaps: objects(filter: { type: "0x2::kiosk::KioskOwnerCap" }) {
								nodes {
									... on MoveObject {
										contents {
											json
										}
									}
								}
							}
						}
					}
				`;

				const response = await fetch(graphqlUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						query,
						variables: { userAddress: account.address, nftType },
					}),
				});

				if (!response.ok) return;

				const result = await response.json();
				if ((result as { errors?: unknown[] }).errors) return;

				const { data } = result as {
					data?: {
						address?: { objects?: { nodes?: unknown[] }; kioskCaps?: { nodes?: unknown[] } };
					};
				};
				const { objects: directNfts, kioskCaps } = data?.address || {};

				if (directNfts?.nodes && directNfts.nodes.length > 0) {
					localStorage.setItem(cacheKey, JSON.stringify({ ownsNft: true, timestamp: Date.now() }));
					setOwnsNft(true);
					return;
				}

				for (const kioskCap of (kioskCaps?.nodes as { contents?: { json?: { for?: string } } }[]) ||
					[]) {
					const kioskCapContent = kioskCap.contents?.json;
					const kioskId = kioskCapContent?.for;
					if (!kioskId) continue;

					const kioskQuery = `
						query ($kioskId: String!) {
							object(address: $kioskId) {
								dynamicFields {
									nodes {
										value {
											... on MoveObject {
												contents {
													type { repr }
												}
											}
										}
									}
								}
							}
						}
					`;

					const kioskResponse = await fetch(graphqlUrl, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							query: kioskQuery,
							variables: { kioskId },
						}),
					});

					if (kioskResponse.ok) {
						const kioskResult = await kioskResponse.json();
						if ((kioskResult as { errors?: unknown[] }).errors) continue;

						const kioskData = kioskResult as {
							data?: {
								object?: {
									dynamicFields?: {
										nodes?: { value?: { contents?: { type?: { repr?: string } } } }[];
									};
								};
							};
						};
						if (kioskData.data?.object?.dynamicFields?.nodes) {
							for (const field of kioskData.data.object.dynamicFields.nodes) {
								const itemType = field.value?.contents?.type?.repr;
								if (itemType?.includes(nftType)) {
									localStorage.setItem(
										cacheKey,
										JSON.stringify({ ownsNft: true, timestamp: Date.now() }),
									);
									setOwnsNft(true);
									return;
								}
							}
						}
					}
				}

				setOwnsNft(false);
			} catch (_error) {
				setOwnsNft(false);
			}
		};

		checkNftOwnership();
	}, [account?.address, network, beelieversMint.pkgId]);

	return ownsNft ? (
		<div className="badge badge-primary badge-sm gap-1">
			<img src="/assets/ui-icons/beelievers-badge2.svg" alt="Beeliever" className="h-4 w-4" />
			Beeliever
		</div>
	) : null;
}
