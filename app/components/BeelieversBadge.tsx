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

			const cacheKey = getCacheKey(account.address, network);
			const cachedResult = getCachedOwnership(cacheKey);
			if (cachedResult !== null) {
				setOwnsNft(cachedResult);
				return;
			}

			try {
				const nftType = `${beelieversMint.pkgId}::mint::BeelieverNFT`;
				const graphqlUrl = getGraphqlUrl(network);

				const ownsNftResult = await queryNFTOwnership(graphqlUrl, account.address, nftType);

				setCachedOwnership(cacheKey, ownsNftResult);
				setOwnsNft(ownsNftResult);
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

function getCacheKey(address: string, network: string): string {
	return `beelievers_nft_${address}_${network}`;
}

function getCachedOwnership(cacheKey: string): boolean | null {
	const cached = localStorage.getItem(cacheKey);
	if (!cached) return null;

	const { ownsNft, timestamp } = JSON.parse(cached);
	if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
		return ownsNft;
	}

	localStorage.removeItem(cacheKey);
	return null;
}

function setCachedOwnership(cacheKey: string, ownsNft: boolean): void {
	localStorage.setItem(cacheKey, JSON.stringify({ ownsNft, timestamp: Date.now() }));
}

function getGraphqlUrl(network: string): string {
	return network === "mainnet"
		? "https://graphql.mainnet.sui.io/graphql"
		: "https://graphql.testnet.sui.io/graphql";
}

async function queryNFTOwnership(graphqlUrl: string, userAddress: string, nftType: string): Promise<boolean> {
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
			variables: { userAddress, nftType },
		}),
	});

	if (!response.ok) return false;

	const result = await response.json();
	if ((result as { errors?: unknown[] }).errors) return false;

	const { data } = result as {
		data?: {
			address?: { objects?: { nodes?: unknown[] }; kioskCaps?: { nodes?: unknown[] } };
		};
	};
	const { objects: directNfts, kioskCaps } = data?.address || {};

	if (directNfts?.nodes?.length) {
		return true;
	}

	const kioskCapsNodes = kioskCaps?.nodes as { contents?: { json?: { for?: string } } }[] | undefined;
	if (!kioskCapsNodes) return false;

	for (const kioskCap of kioskCapsNodes) {
		const kioskId = kioskCap.contents?.json?.for;
		if (!kioskId) continue;

		const hasNftInKiosk = await queryKioskForNft(graphqlUrl, kioskId, nftType);
		if (hasNftInKiosk) return true;
	}

	return false;
}

async function queryKioskForNft(graphqlUrl: string, kioskId: string, nftType: string): Promise<boolean> {
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

	if (!kioskResponse.ok) return false;

	const kioskResult = await kioskResponse.json();
	if ((kioskResult as { errors?: unknown[] }).errors) return false;

	const kioskData = kioskResult as {
		data?: {
			object?: {
				dynamicFields?: {
					nodes?: { value?: { contents?: { type?: { repr?: string } } } }[];
				};
			};
		};
	};

	const nodes = kioskData.data?.object?.dynamicFields?.nodes;
	if (!nodes) return false;

	for (const field of nodes) {
		const itemType = field.value?.contents?.type?.repr;
		if (itemType?.includes(nftType)) {
			return true;
		}
	}

	return false;
}
