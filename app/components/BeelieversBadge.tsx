import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { logError, logHttpError } from "~/lib/log";

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

			const cacheKey = mkCacheKey(account.address, network);
			const cachedResult = getCachedOwnership(cacheKey);
			if (cachedResult !== null) {
				setOwnsNft(cachedResult);
				return;
			}

			try {
				const nftType = `${beelieversMint.pkgId}::mint::BeelieverNFT`;
				const graphqlUrl = mkGraphqlUrl(network);
				const ownsNftResult = await queryNFTOwnership(graphqlUrl, account.address, nftType);

				setCachedOwnership(cacheKey, ownsNftResult);
				setOwnsNft(ownsNftResult);
			} catch (error) {
				logError(
					{ msg: "BeelieversBadge: Failed to check NFT ownership", method: "checkNftOwnership" },
					error,
				);
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

function mkCacheKey(address: string, network: string): string {
	return `beelievers_nft_${address}_${network}`;
}

function getCachedOwnership(cacheKey: string): boolean | null {
	const cached = localStorage.getItem(cacheKey);
	if (!cached) return null;

	const { ownsNft, timestamp } = JSON.parse(cached);
	if (Date.now() - timestamp < 60 * 60 * 1000) {
		return ownsNft;
	}

	localStorage.removeItem(cacheKey);
	return null;
}

function setCachedOwnership(cacheKey: string, ownsNft: boolean): void {
	localStorage.setItem(cacheKey, JSON.stringify({ ownsNft, timestamp: Date.now() }));
}

function mkGraphqlUrl(network: string): string {
	switch (network) {
		case "mainnet":
			return "https://graphql.mainnet.sui.io/graphql";
		case "testnet":
			return "https://graphql.testnet.sui.io/graphql";
		default:
			return "https://graphql.testnet.sui.io/graphql";
	}
}

async function queryNFTOwnership(graphqlUrl: string, userAddress: string, nftType: string): Promise<boolean> {
	const kioskQuery = `
		query ($userAddress: String!) {
			address(address: $userAddress) {
				objects(filter: { type: "0x2::kiosk::KioskOwnerCap" }) {
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
			query: kioskQuery,
			variables: { userAddress },
		}),
	});

	if (!response.ok) {
		await logHttpError(
			{ msg: "BeelieversBadge: GraphQL request failed", method: "queryNFTOwnership" },
			response,
		);
		return false;
	}

	const result = await response.json();
	if ((result as { errors?: unknown[] }).errors) {
		logError({
			msg: "BeelieversBadge: GraphQL errors",
			method: "queryNFTOwnership",
			error: (result as { errors?: unknown[] }).errors,
		});
		return false;
	}

	const { data } = result as {
		data?: {
			address?: { objects?: { nodes?: unknown[] } };
		};
	};

	const kioskCaps = data?.address?.objects?.nodes as
		| { contents?: { json?: { for?: string } } }[]
		| undefined;
	if (!kioskCaps?.length) return false;

	const kioskIds: string[] = [];
	for (const cap of kioskCaps) {
		const kioskId = cap.contents?.json?.for;
		if (kioskId) kioskIds.push(kioskId);
	}

	if (!kioskIds.length) return false;

	return await queryKiosksForNft(graphqlUrl, kioskIds, nftType);
}

async function queryKiosksForNft(graphqlUrl: string, kioskIds: string[], nftType: string): Promise<boolean> {
	for (const kioskId of kioskIds) {
		const query = `
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

		try {
			const response = await fetch(graphqlUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query,
					variables: { kioskId },
				}),
			});

			if (!response.ok) {
				await logHttpError(
					{ msg: "BeelieversBadge: Kiosk query failed", method: "queryKiosksForNft" },
					response,
				);
				continue;
			}

			const result = await response.json();
			if ((result as { errors?: { message: string }[] }).errors) {
				const errors = (result as { errors?: { message: string }[] }).errors;
				logError({
					msg: `BeelieversBadge: GraphQL errors for kiosk ${kioskId}`,
					method: "queryKiosksForNft",
					error: errors?.map((e) => e.message).join(", "),
				});
				continue;
			}

			const kioskData = result as {
				data?: {
					object?: {
						dynamicFields?: {
							nodes?: { value?: { contents?: { type?: { repr?: string } } } }[];
						};
					};
				};
			};

			const nodes = kioskData.data?.object?.dynamicFields?.nodes;
			if (!nodes) continue;

			for (const field of nodes) {
				const itemType = field.value?.contents?.type?.repr;
				if (itemType?.includes(nftType)) {
					return true;
				}
			}
		} catch (error) {
			logError(
				{ msg: `BeelieversBadge: Failed to query kiosk ${kioskId}`, method: "queryKiosksForNft" },
				error,
			);
			continue;
		}
	}

	return false;
}
