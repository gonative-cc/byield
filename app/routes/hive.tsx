import { isProductionMode } from "~/lib/appenv";
import { toast } from "~/hooks/use-toast";
import { useEffect } from "react";
import type { Route } from "./+types/hive";
import { HiveController } from "~/server/hive/controller.server";
import { ControlledHiveTabs } from "~/pages/Hive/ControlledHiveTabs";
import { useSuiNetwork } from "~/hooks/useSuiNetwork";

// This is a server hive to post data to server (data mutations)
export async function action({ request, context }: Route.ActionArgs) {
	const TBOOK_AUTH_TOKEN = context.cloudflare.env.TBOOK_AUTH_TOKEN;
	const reqData = await request.clone().json();
	const { params } = reqData as { params: [string, string] };
	const graphqlURl = params[0];

	const ctrl = new HiveController(TBOOK_AUTH_TOKEN, graphqlURl);
	return ctrl.handleJsonRPC(request);
}

export default function Hive() {
	const { network } = useSuiNetwork();

	useEffect(() => {
		const isMainnet = network === "mainnet";
		// app is in production -> support mainnet only
		if (isProductionMode() && !isMainnet) {
			toast({ title: "Testnet is not supported. Switch to mainnet", variant: "warning" });
		} else if (!isProductionMode() && isMainnet) {
			// app is in backstage -> support testnet only
			toast({ title: "Mainnet is not supported. Switch to testnet", variant: "warning" });
		}
	}, [network]);

	return (
		<div className="flex justify-center px-4 py-4 md:px-15">
			<ControlledHiveTabs />
		</div>
	);
}
