import { useState, useEffect } from "react";
import { useSuiClientContext } from "@mysten/dapp-kit";
import type { SuiClient } from "@mysten/sui/client";
import { ExternalLink } from "lucide-react";
import { trimAddress } from "~/components/Wallet/walletHelper";

interface NftMetadata {
	id: string;
	name: string;
	image_url: string;
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
			return {
				id: nftId,
				name: fields.name || "Beeliever NFT",
				image_url: fields.image_url || "",
				token_id: fields.token_id || "0",
				attributes: fields.attributes || { fields: { contents: [] } },
				badges: fields.badges || [],
			};
		}
		return null;
	} catch (error) {
		console.error("Error fetching NFT metadata:", error);
		return null;
	}
}

export interface NftDisplayProps {
	nftId: string;
}

export function NftDisplay({ nftId }: NftDisplayProps) {
	const [metadata, setMetadata] = useState<NftMetadata | null>(null);
	const { network, client } = useSuiClientContext();

	useEffect(() => {
		if (nftId) {
			fetchNftMetadata(client, nftId).then(setMetadata);
		}
	}, [nftId, client]);

	if (!metadata) return;

	const imageUrl = mkWalrusImageUrl(metadata.image_url);
	const nftType = getAttributeValue(metadata.attributes, "Type");
	const mythicName = getAttributeValue(metadata.attributes, "Mythic Name");
	const background = getAttributeValue(metadata.attributes, "Background");

	return (
		<div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-orange-400/10 rounded-lg border border-primary/20">
			<div className="flex items-start gap-4">
				<div className="flex-shrink-0">
					{imageUrl ? (
						<a
							href={imageUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="block hover:opacity-80 transition-opacity cursor-pointer"
							title="Click to view full-size image"
						>
							<img
								src={imageUrl}
								alt={metadata.name || "Beeliever NFT"}
								className="w-20 h-20 rounded-lg border-2 border-primary/20 object-cover hover:border-primary/40 transition-colors"
								onError={(e) => {
									e.currentTarget.style.display = "none";
									const fallback = e.currentTarget.parentElement
										?.nextElementSibling as HTMLElement;
									if (fallback) fallback.classList.remove("hidden");
								}}
							/>
						</a>
					) : null}
					<div
						className={`w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center text-2xl ${
							imageUrl ? "hidden" : ""
						}`}
					>
						🐝
					</div>
				</div>

				<div className="flex-1">
					<div className="space-y-4">
						<h4 className="font-semibold text-primary flex items-center gap-2">
							🎉 {metadata.name || "Beeliever NFT"} Minted!
						</h4>

						<div className="space-y-2">
							{nftType && (
								<div className="flex items-center gap-2">
									<span
										className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
											nftType === "Mythic"
												? "bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-400 border border-yellow-400/30"
												: "bg-primary/20 text-primary border border-primary/30"
										}`}
									>
										{nftType === "Mythic" ? "✨" : "🐝"} {nftType}
									</span>
									{mythicName && (
										<span className="text-xs text-muted-foreground">{mythicName}</span>
									)}
								</div>
							)}

							{background && (
								<div className="text-xs text-muted-foreground">Background: {background}</div>
							)}

							{metadata.badges && metadata.badges.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{metadata.badges.map((badge, index) => (
										<span
											key={index}
											className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-400/30"
										>
											{badge}
										</span>
									))}
								</div>
							)}

							<div className="text-xs text-muted-foreground">
								Beeliever #{metadata.token_id} <br />
								Object ID: {nftId}
							</div>
						</div>

						{/* Move the View NFT button to bottom and fix styling */}
						<div className="pt-2">
							<a
								href={mkSuiVisionUrl(nftId, network)}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-4 py-2 bg-primary/90 text-white border border-white/10 rounded-lg hover:bg-primary transition-colors font-medium text-sm shadow-[inset_0_4px_10px_0_rgba(255,255,255,0.25),inset_0_-4px_10px_0_rgba(255,255,255,0.15)]"
							>
								<ExternalLink size={16} />
								View on SuiVision
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function mkSuiVisionUrl(objectId: string, network: string): string {
	// TODO: let's define it in contracts-*.json, next to the `accountExplorer`.
	const baseUrl = network === "mainnet" ? "https://suivision.xyz" : "https://testnet.suivision.xyz";
	return `${baseUrl}/object/${objectId}`;
}

function mkWalrusImageUrl(imageUrl: string): string {
	if (imageUrl.startsWith("http")) {
		return imageUrl;
	}
	return `https://walrus.tusky.io/${imageUrl}`;
}

function getAttributeValue(attributes: NftMetadata["attributes"], key: string): string {
	const attr = attributes.fields.contents.find((item) => item.fields.key === key);
	return attr?.fields.value || "";
}

export const queryNftFromKiosk = async (kioskId: string, client: SuiClient): Promise<string | null> => {
	try {
		const kioskObjects = await client.getDynamicFields({
			parentId: kioskId,
		});

		for (const obj of kioskObjects.data) {
			if (obj.name.type.includes("Item")) {
				const itemObject = await client.getObject({
					id: obj.objectId,
					options: { showContent: true, showType: true },
				});

				if (itemObject.data?.type?.includes("mint::")) {
					if (itemObject.data.content && "fields" in itemObject.data.content) {
						const fields = itemObject.data.content.fields;
						return fields.id?.id || fields.object_id || obj.objectId;
					}
					return obj.objectId; // Fallback to dynamic field ID if content parsing fails
				}
			}
		}
		return null;
	} catch (error) {
		console.error("Error querying NFT from kiosk:", error);
		return null;
	}
};

export const queryNftByModule = async (
	address: string,
	client: SuiClient,
	packageId: string,
): Promise<string | null> => {
	try {
		const ownedObjects = await client.getOwnedObjects({
			owner: address,
			filter: {
				StructType: `${packageId}::mint::BeelieverNFT`,
			},
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
};

export const findExistingNft = async (
	address: string,
	client: SuiClient,
	kioskId: string | null,
	packageId: string,
): Promise<string | null> => {
	if (kioskId) {
		const nftFromKiosk = await queryNftFromKiosk(kioskId, client);
		if (nftFromKiosk) return nftFromKiosk;
	}

	return await queryNftByModule(address, client, packageId);
};

export const storeNftId = (address: string, nftId: string): void => {
	localStorage.setItem(`nftId-${address}`, nftId);
};

export const getStoredNftId = (address: string): string | null => {
	return localStorage.getItem(`nftId-${address}`);
};

export const removeStoredNftId = (address: string): void => {
	localStorage.removeItem(`nftId-${address}`);
};
