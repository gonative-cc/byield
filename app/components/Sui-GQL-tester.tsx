/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";

export function SuiGQLTester() {
	const account = useCurrentAccount();
	const { network } = useSuiClientContext();
	const [kioskData, setKioskData] = useState<any[]>([]);

	useEffect(() => {
		const fetchKiosksAndNFTs = async () => {
			const graphqlUrl =
				network === "mainnet"
					? "https://graphql.mainnet.sui.io/graphql"
					: "https://graphql.testnet.sui.io/graphql";

			const kioskQuery = `
        query ($userAddress: SuiAddress!) {
          address(address: $userAddress) {
            objects(filter: { type: "0x2::kiosk::KioskOwnerCap" }) {
              nodes {
                ... on MoveObject {
                  address
                  contents { json }
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
					variables: { userAddress: account?.address },
				}),
			});

			const kioskResult = (await kioskResponse.json()) as any;
			const kioskCaps = kioskResult.data.address.objects.nodes;
			const kioskWithNFTs = [];

			for (const cap of kioskCaps) {
				const kioskId = cap.contents.json.for;

				const nftQuery = `
          query ($kioskId: SuiAddress!) {
            object(address: $kioskId) {
              dynamicFields {
                nodes {
                  name {
                    type { repr }
                  }
                  value {
                    ... on MoveObject {
                      address
                    }
                  }
                }
              }
            }
          }
        `;

				const nftResponse = await fetch(graphqlUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						query: nftQuery,
						variables: { kioskId },
					}),
				});

				const nftResult = (await nftResponse.json()) as any;
				const dynamicFields = nftResult.data.object.dynamicFields.nodes;
				const nfts = dynamicFields.filter((field: any) => field.name.type.repr.includes("Item"));

				kioskWithNFTs.push({
					capAddress: cap.address,
					kioskAddress: kioskId,
					nftAddresses: nfts.map((nft: any) => nft.value.address),
				});
			}

			setKioskData(kioskWithNFTs);
		};

		fetchKiosksAndNFTs();
	}, [account?.address, network]);

	return (
		<div className="p-4">
			<h2 className="mb-4 text-xl font-bold">KioskCaps & NFTs</h2>
			<p>Address: {account?.address}</p>

			{kioskData.map((kiosk, idx) => (
				<div key={kiosk.capAddress} className="mb-4 rounded border p-4">
					<h3 className="text-lg font-bold">Kiosk #{idx + 1}</h3>

					<div className="mb-2">
						<p>
							<strong>KioskCap Address:</strong>
						</p>
						<code className="block bg-black p-1 text-sm text-white">{kiosk.capAddress}</code>
					</div>

					<div className="mb-2">
						<p>
							<strong>Kiosk Address:</strong>
						</p>
						<code className="block bg-black p-1 text-sm text-white">{kiosk.kioskAddress}</code>
					</div>

					<div>
						<p>
							<strong>NFTs ({kiosk.nftAddresses.length}):</strong>
						</p>
						{kiosk.nftAddresses.length === 0 ? (
							<p className="text-black italic">No NFTs in this kiosk</p>
						) : (
							kiosk.nftAddresses.map((nftAddr: string) => (
								<code key={nftAddr} className="mb-1 block bg-black p-1 text-sm text-white">
									{nftAddr}
								</code>
							))
						)}
					</div>
				</div>
			))}
		</div>
	);
}
