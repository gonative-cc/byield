import type { Route } from "./+types/reserve-dashboard";
import { ReserveController } from "~/server/reserve-dashboard/controller.server";
import { BitcoinNetworkType } from "sats-connect";
import { ReserveDashboard } from "~/pages/ReserveDashboard/ReserveDashboard";

const validNetworks: BitcoinNetworkType[] = [
	BitcoinNetworkType.Mainnet,
	BitcoinNetworkType.Testnet4,
	BitcoinNetworkType.Regtest,
];

// This is a server mint to post data to server (data mutations)
export async function action({ request, context }: Route.ActionArgs) {
	const env = context.cloudflare.env;
	const reqData = await request.clone().json();
	const { params } = reqData as { params: [BitcoinNetworkType, string, string] };
	const network = params[0];
	const graphqlURl = params[1];

	if (!network || !validNetworks.includes(network)) {
		throw new Error("Invalid network type");
	}

	const ctrl = new ReserveController(network, graphqlURl, env.BYieldD1);
	return ctrl.handleJsonRPC(request);
}

export default function ReserveDashboardPage() {
	return (
		<div className="flex justify-center py-4 md:px-10">
			<ReserveDashboard />
		</div>
	);
}
