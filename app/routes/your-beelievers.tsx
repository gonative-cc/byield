import { useEffect } from "react";
import { useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";

import { YourBeelievers } from "~/pages/YourBeelievers/YourBeelievers";
import { isProductionMode } from "~/lib/appenv";
import { toast } from "~/hooks/use-toast";
import { GRADIENTS, cn } from "~/tailwind";

export default function YourBeelieversPage() {
	const { network } = useSuiClientContext();
	const { mutate: disconnect } = useDisconnectWallet();
	const isTestnet = network === "testnet";

	useEffect(() => {
		if (isProductionMode() && isTestnet) {
			disconnect();
			toast({ title: "Testnet is not supported. Switch to mainnet", variant: "warning" });
		}
	}, [disconnect, isTestnet]);

	return (
		<div className={cn(GRADIENTS.pageBg, "p-4 sm:p-6 lg:p-8")}>
			<div className="flex justify-center">
				<div className="animate-in fade-in-0 w-full max-w-7xl duration-700">
					<YourBeelievers />
				</div>
			</div>
		</div>
	);
}
