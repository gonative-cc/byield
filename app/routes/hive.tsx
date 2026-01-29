import { isProductionMode } from "~/lib/appenv";
import { toast } from "~/hooks/use-toast";
import { useEffect } from "react";
import type { Route } from "./+types/hive";
import { HiveController } from "~/server/hive/controller.server";
import { useSuiNetwork } from "~/hooks/useSuiNetwork";
import { Dashboard } from "~/pages/Hive/Dashboard";

// This is a server hive to post data to server (data mutations)
export async function action({ request, context }: Route.ActionArgs) {
	const TBOOK_AUTH_TOKEN = context.cloudflare.env.TBOOK_AUTH_TOKEN;
	const reqData = await request.clone().json();
	const { params } = reqData as { params: [string, string, string] };

	if (!Array.isArray(params) || params.length < 2) {
		throw new Response("Missing or invalid 'params' array", { status: 400 });
	}

	const graphqlURl = params[0];
	const tbookURL = params[1];

	if (typeof graphqlURl !== "string") throw new Error("GraphQL URL doesn't have of type of string");
	if (typeof tbookURL !== "string") throw new Error("tbookURL doesn't have of type of string");

	const ctrl = new HiveController(TBOOK_AUTH_TOKEN, graphqlURl, tbookURL);
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
		<main className="flex w-full flex-col justify-center gap-4 px-4 py-4 md:px-15">
			<a
				href="https://www.gonative.cc/hive-faq"
				target="_blank"
				className="link link-primary text-center"
				rel="noopener noreferrer"
			>
				➡️ Read the FAQ to learn more
			</a>
			<section className="w-full max-w-7xl">
				<Dashboard />
			</section>
		</main>
	);
}
