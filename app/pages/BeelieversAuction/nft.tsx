import { useState, useEffect } from "react";
import { useSuiClientContext } from "@mysten/dapp-kit";
import type { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { ExternalLink } from "lucide-react";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { GRADIENTS } from "~/util/tailwind";
import { mkSuiVisionUrl, mkWalrusImageUrl } from "~/lib/suienv";
import { useNetworkVariables } from "~/networkConfig";

interface NftMetadata {
	id: string;
	name: string;
	image_id: string;
	token_id: string;
	attributes: {
		fields: {
			contents: Array<{
				fields: {
					key: string;
					value: string;
				};
			}>;
		};
	};
	badges: string[];
}

async function fetchNftMetadata(client: SuiClient, nftId: string): Promise<NftMetadata | null> {
	try {
		const nftObject = await client.getObject({
			id: nftId,
			options: { showContent: true },
		});

		if (nftObject.data?.content && "fields" in nftObject.data.content) {
			// @ts-expect-error fields is of type MoveStruct which is a variant
			const fields = nftObject.data.content.fields as NftMetadata;

			const metadata = {
				id: nftId,
				name: fields.name || "Beeliever NFT",
				image_id: fields.image_id || "",
				token_id: fields.token_id || "0",
				attributes: fields.attributes || { fields: { contents: [] } },
				badges: fields.badges || [],
			};

			return metadata;
		}
		return null;
	} catch (error) {
		console.error(">>> Error: fetchNftMetadata", error);
		return null;
	}
}

export interface NftDisplayProps {
	nftId: string;
}

export function NftDisplay({ nftId }: NftDisplayProps) {
	const [metadata, setMetadata] = useState<NftMetadata | null>(null);
	const { client } = useSuiClientContext();
	const contractsConfig = useNetworkVariables();

	useEffect(() => {
		if (nftId) {
			fetchNftMetadata(client, nftId).then(setMetadata);
		}
	}, [nftId, client]);

	if (!metadata) return;

	const imageUrl = mkWalrusImageUrl(metadata.image_id);
	const nftType = getAttributeValue(metadata.attributes, "Type");
	const mythicName = getAttributeValue(metadata.attributes, "Mythic Name");
	const background = getAttributeValue(metadata.attributes, "Background");

	const name = (nftType === "Mythic" ? "✨ " : "🐝 ") + nftType + ": " + (mythicName || metadata.name);
	const nameCls = "font-bold my-2 text-base " + (nftType === "Mythic" ? "text-warning" : "text-primary");

	return (
		<div className={`${GRADIENTS.primaryNftBg} w-full rounded-2xl p-6 md:max-w-xs md:min-w-xs`}>
			<div className="flex flex-col items-center gap-3">
				<p className="text-primary text-xl font-bold">Your BTCFi Beeliever</p>
				{imageUrl ? (
					<a
						href={imageUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-2xl transition-transform hover:scale-105"
						title="Click to view full-size image"
					>
						<img
							src={imageUrl}
							alt={metadata.name || "Beeliever NFT"}
							className="border-primary/20 rounded-2xl border-2 object-cover"
							onError={(e) => {
								e.currentTarget.style.display = "none";
								const fallback = e.currentTarget.parentElement
									?.nextElementSibling as HTMLElement;
								if (fallback) fallback.classList.remove("hidden");
							}}
						/>
					</a>
				) : (
					<div
						className={`${GRADIENTS.primaryNft} border-primary/20 flex h-48 w-48 items-center justify-center rounded-2xl border-2 text-6xl`}
					>
						🐝
					</div>
				)}

				<div className="text-muted-foreground w-full text-sm">
					<p className={nameCls}>{name}</p>
					<p>Beeliever #{metadata.token_id}</p>
					<p>Object ID: {trimAddress(nftId)}</p>
					{background && <p>Background: {background}</p>}

					{metadata.badges && metadata.badges.length > 0 && (
						<>
							<p> Badges: </p>
							<div className="my-2 flex flex-wrap justify-center gap-2">
								{metadata.badges.map((badge, index) => (
									<span key={index} className="badge badge-secondary badge-outline">
										{badge}
									</span>
								))}
							</div>
						</>
					)}

					<div className="text-foreground flex w-full justify-center pt-3">
						<a
							href={mkSuiVisionUrl(nftId, contractsConfig)}
							target="_blank"
							rel="noopener noreferrer"
						>
							<button className="btn btn-primary">
								<ExternalLink size={16} />
								View on SuiVision
							</button>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

function getAttributeValue(attributes: NftMetadata["attributes"], key: string): string {
	const attr = attributes.fields.contents.find((item) => item.fields.key === key);
	return attr?.fields.value || "";
}

function nFTType(pkgId: string): string {
	return pkgId + "::mint::BeelieverNFT";
}

export async function queryNftFromKiosk(
	kioskId: string,
	mintPkgId: string,
	client: SuiClient,
): Promise<string | null> {
	try {
		const kioskObjects = await client.getDynamicFields({
			parentId: kioskId,
		});
		const nftTypeName = nFTType(mintPkgId);
		for (const obj of kioskObjects.data) {
			if (obj.name.type.includes("Item")) {
				const itemObject = await client.getObject({
					id: obj.objectId,
					options: { showContent: true, showType: true },
				});

				if (itemObject.data?.type?.includes(nftTypeName)) {
					if (itemObject.data.content && "fields" in itemObject.data.content) {
						console.log("found nft in kiosk", itemObject.data);
						return obj.objectId;
					}
				}
			}
		}
		return null;
	} catch (error) {
		console.error("Error querying NFT from kiosk:", error);
		return null;
	}
}

export async function queryNftByModule(
	address: string,
	client: SuiClient,
	mintPkgId: string,
): Promise<string | null> {
	try {
		const ownedObjects = await client.getOwnedObjects({
			owner: address,
			filter: { StructType: nFTType(mintPkgId) },
			options: {
				showType: true,
				showContent: true,
			},
		});

		if (ownedObjects.data.length > 0) {
			return ownedObjects.data[0].data?.objectId || null;
		}

		return null;
	} catch (error) {
		console.error("Error querying NFT by module:", error);
		return null;
	}
}

export const findExistingNft = async (
	address: string,
	client: SuiClient,
	mintPkgId: string,
	kioskId?: string,
): Promise<string | null> => {
	if (kioskId) {
		const nftFromKiosk = await queryNftFromKiosk(kioskId, mintPkgId, client);
		if (nftFromKiosk) return nftFromKiosk;
	}

	return await queryNftByModule(address, client, mintPkgId);
};

export function findNftInTxResult(result: SuiTransactionBlockResponse): string | null {
	try {
		if (result.events) {
			console.log(">>> Mint Events:", result.events);
			for (const event of result.events) {
				if (
					event.type.includes("::mint::NFTMinted") &&
					(event.parsedJson as NFTMintedEvent)?.nft_id
				) {
					const nftId = (event.parsedJson as NFTMintedEvent).nft_id;
					console.log(">>> Extracted NFT ID from event:", nftId);
					return nftId;
				}
			}
		}
		console.log(">>> No NFTMinted event found - NFT is likely stored in kiosk");
		return null;
	} catch (error) {
		console.error("Error extracting NFT ID:", error);
		return null;
	}
}

interface NFTMintedEvent {
	nft_id: string;
	token_id: number;
	minter: string;
}
