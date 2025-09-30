import { isProductionMode } from "~/lib/appenv";
import { SelectWallet } from "./SelectWallet";
import { Menu } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { BeelieversBadge } from "./BeelieversBadge";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { Transaction } from "@mysten/sui/transactions";

export function NavBar() {
	const isProd = isProductionMode();
	const { toggleMobileMenu } = useContext(SideBarContext);

	// Simple check: has user minted Beelievers NFT?
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

	return (
		<header className="flex w-full h-14 items-center px-1 md:pr-10 sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 justify-end">
			<div className="flex w-full md:hidden">
				<button className="md:hidden focus:outline-hidden mr-2" onClick={toggleMobileMenu}>
					<Menu className="h-6 w-6" />
				</button>
				<img src="/assets/app-logos/logo-mobile.svg" alt="Remix" className="block md:hidden" />
			</div>
			<div className="flex items-center gap-4">
				<BeelieversBadge hasMinted={hasMinted} size="md" />
				<SelectWallet isProductionMode={isProd} />
			</div>
		</header>
	);
}
