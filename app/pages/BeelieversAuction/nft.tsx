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
		<div className="md:min-w-xs w-full md:max-w-xs p-6 bg-gradient-to-br from-primary/5 to-yellow-400/5 rounded-2xl">
			<div className="flex flex-col items-center gap-4">
				{imageUrl ? (
					<a
						href={imageUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="block rounded-2xl hover:scale-105 transition-transform"
						title="Click to view full-size image"
					>
						<img
							src={imageUrl}
							alt={metadata.name || "Beeliever NFT"}
							className="w-32 h-32 object-cover border-2 border-primary/20 rounded-2xl"
							onError={(e) => {
								e.currentTarget.style.display = "none";
								const fallback = e.currentTarget.parentElement
									?.nextElementSibling as HTMLElement;
								if (fallback) fallback.classList.remove("hidden");
							}}
						/>
					</a>
				) : (
					<div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center text-4xl border-2 border-primary/20">
						🐝
					</div>
				)}

				<div className="w-full space-y-3 text-center">
					<div className="flex flex-col gap-2">
						<span className="text-xl font-bold text-primary">Your NFT!</span>
						<span className="text-sm text-muted-foreground">Beeliever #{metadata.token_id}</span>
						{nftType && (
							<span
								className={`flex justify-center px-2 py-1 text-sm rounded-full ${
									nftType === "Mythic"
										? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
										: "bg-primary/20 text-primary border border-primary/30"
								}`}
							>
								{nftType === "Mythic" ? "✨ " : "🐝 "}
								{nftType}
								{mythicName ? ": " + mythicName : ""}
							</span>
						)}
						<span className="text-sm text-muted-foreground">Object ID: {trimAddress(nftId)}</span>
					</div>
					<div className="space-y-3">
						{background && (
							<div className="text-sm">
								<span className="text-muted-foreground">Background: </span>
								{background}
							</div>
						)}

						{metadata.badges && metadata.badges.length > 0 && (
							<>
								<span className="text-sm text-muted-foreground">Badges:</span>
								<div className="flex flex-wrap justify-center gap-2 mt-2">
									{metadata.badges.map((badge, index) => (
										<span
											key={index}
											className="text-sm px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-400/30"
										>
											{badge}
										</span>
									))}
								</div>
							</>
						)}
					</div>

					<div className="pt-2">
						<a
							href={mkSuiVisionUrl(nftId, network)}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
						>
							<ExternalLink size={16} />
							View on SuiVision
						</a>
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
					return obj.objectId;
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
