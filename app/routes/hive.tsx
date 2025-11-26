import { useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";
import { isProductionMode } from "~/lib/appenv";
import { HivePage } from "~/pages/Hive/Hive";
import { toast } from "~/hooks/use-toast";
import { useEffect } from "react";

export default function Hive() {
	const { network } = useSuiClientContext();
	const { mutate: disconnect } = useDisconnectWallet();
	const isMainnet = network === "mainnet";

	useEffect(() => {
		if (isProductionMode() && !isMainnet) {
			disconnect();
			toast({ title: "Testnet is not supported. Switch to mainnet", variant: "warning" });
		}
	}, [disconnect, isMainnet, network]);

	return (
		<div className="flex justify-center py-4 md:px-10">
			<HivePage />
		</div>
	);
}
