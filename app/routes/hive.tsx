import { useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";
import { isProductionMode } from "~/lib/appenv";
import { toast } from "~/hooks/use-toast";
import { useEffect } from "react";
import type { Route } from "./+types/hive";
import { HiveController } from "~/server/hive/controller.server";
import { ControlledHiveTabs } from "~/pages/Hive/ControlledHiveTabs";

// This is a server hive to post data to server (data mutations)
export async function action({ request, context }: Route.ActionArgs) {
	const TBOOK_AUTH_TOKEN = context.cloudflare.env.TBOOK_AUTH_TOKEN;
	const ctrl = new HiveController(TBOOK_AUTH_TOKEN);
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
		<div className="flex justify-center px-4 py-4 md:px-15">
			<ControlledHiveTabs />
		</div>
	);
}
