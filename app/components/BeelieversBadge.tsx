import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { Transaction } from "@mysten/sui/transactions";

export function BeelieversBadge() {
	const [hasMinted, setHasMinted] = useState(false);
	const account = useCurrentAccount();
	const { client } = useSuiClientContext();
	const { beelieversMint } = useNetworkVariables();

	useEffect(() => {
		async function checkMinted() {
			if (!account?.address || !beelieversMint.pkgId) {
				setHasMinted(false);
				return;
			}

			try {
				const txb = new Transaction();
				txb.moveCall({
					target: `${beelieversMint.pkgId}::mint::has_minted`,
					arguments: [txb.object(beelieversMint.collectionId), txb.pure.address(account.address)],
				});

				const result = await client.devInspectTransactionBlock({
					sender: account.address,
					transactionBlock: txb,
				});

				setHasMinted(result.results?.[0]?.returnValues?.[0]?.[0]?.[0] === 1);
			} catch {
				setHasMinted(false);
			}
		}

		checkMinted();
	}, [account?.address, client, beelieversMint]);

	if (!hasMinted) {
		return null;
	}

	return (
		<div className="badge badge-warning gap-1 text-xs">
			<img src="/assets/ui-icons/beelievers-badge2.svg" alt="Beeliever" className="w-3 h-3" />
			Beeliever
		</div>
	);
}
