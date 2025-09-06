import { useState, useEffect } from "react";
import { useSuiClientContext } from "@mysten/dapp-kit";
import type { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { ExternalLink } from "lucide-react";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { Button } from "~/components/ui/button";

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
			return {
				id: nftId,
				name: fields.name || "Beeliever NFT",
				image_id: fields.image_id || "",
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

	const imageUrl = mkWalrusImageUrl(metadata.image_id);
	const nftType = getAttributeValue(metadata.attributes, "Type");
	const mythicName = getAttributeValue(metadata.attributes, "Mythic Name");
	const background = getAttributeValue(metadata.attributes, "Background");

	const name = (nftType === "Mythic" ? "✨ " : "🐝 ") + nftType + ": " + (mythicName || metadata.name);
	const nameCls = "font-bold my-2 text-base " + (nftType === "Mythic" ? "text-yellow-400" : "text-primary");

	return (
		<div className="md:min-w-xs w-full md:max-w-xs p-6 bg-gradient-to-br from-primary/5 to-yellow-400/5 rounded-2xl">
			<div className="flex flex-col items-center gap-4">
				<p className="text-xl font-bold text-primary">Your BTCFi Beeliever</p>
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
							className="object-cover border-2 border-primary/20 rounded-2xl"
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

				<div className="w-full text-sm text-muted-foreground">
					<p className={nameCls}>{name}</p>
					<p>Beeliever #{metadata.token_id}</p>
					<p>Object ID: {trimAddress(nftId)}</p>
					{background && <p>Background: {background}</p>}

					{metadata.badges && metadata.badges.length > 0 && (
						<>
							<p> Badges: </p>
							<div className="flex flex-wrap justify-center gap-2 my-2">
								{metadata.badges.map((badge, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-400/30"
									>
										{badge}
									</span>
								))}
							</div>
						</>
					)}

					<div className="pt-2 justify-center w-full flex text-foreground">
						<a href={mkSuiVisionUrl(nftId, network)} target="_blank" rel="noopener noreferrer">
							<Button layout="oneLine">
								<ExternalLink size={16} />
								View on SuiVision
							</Button>
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
	mintPkgId: string,
	kioskId?: string,
): Promise<string | null> => {
	if (kioskId) {
		const nftFromKiosk = await queryNftFromKiosk(kioskId, client);
		if (nftFromKiosk) return nftFromKiosk;
	}

	return await queryNftByModule(address, client, mintPkgId);
};

export function findNftInTxResult(result: SuiTransactionBlockResponse, kioskId?: string): string | null {
	try {
		if (result.events) {
			for (const event of result.events) {
				console.log(">>> Event type:", event.type);

				if (event.type.includes("::mint::NFTMinted")) {
					console.log(">>> Found NFTMinted event:", event);

					if (event.parsedJson?.nft_id) {
						console.log(">>> Extracted NFT ID from event:", event.parsedJson.nft_id);
						return event.parsedJson.nft_id;
					}
				}
			}
		}

		if (result.effects?.created) {
			console.log(">>> Created objects:", result.effects.created);
			for (const obj of result.effects.created) {
				const owner = obj.owner as { Shared?: unknown; AddressOwner?: string; ObjectOwner?: string };

				if (owner.ObjectOwner) {
					console.log(">>> Found potential NFT object in creaetd objects:", obj.reference.objectId);
					if (obj.reference.objectId !== kioskId) {
						return obj.reference.objectId;
					}
				}
			}
		}

		console.log(">>> No NFT ID found in transaction result");
		return null;
	} catch (error) {
		console.error("Error extracting NFT ID:", error);
		return null;
	}
}
