import { useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";
import { isProductionMode } from "~/lib/appenv";
import { HivePage } from "~/pages/Hive/Hive";
import { toast } from "~/hooks/use-toast";
import { useEffect } from "react";
import type { Route } from "./+types/hive";
import { HiveController } from "~/server/hive/controller.server";

// This is a server hive to post data to server (data mutations)
export async function action({ request }: Route.ActionArgs) {
	const ctrl = new HiveController();
	return ctrl.handleJsonRPC(request);
}

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
