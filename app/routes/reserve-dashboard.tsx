import type { Route } from "./+types/reserve-dashboard";
import { ReserveController } from "~/server/reserve-dashboard/controller.server";
import { BitcoinNetworkType } from "sats-connect";
import { useFetcher } from "react-router";
import { useEffect } from "react";
import { makeReq, type QueryLockedBTCResp } from "~/server/reserve-dashboard/jsonrpc";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { ReserveDashboard } from "~/pages/ReserveDashboard/ReserveDashboard";

const validNetworks: BitcoinNetworkType[] = [
	BitcoinNetworkType.Mainnet,
	BitcoinNetworkType.Testnet4,
	BitcoinNetworkType.Regtest,
];

// This is a server mint to post data to server (data mutations)
export async function action({ request }: Route.ActionArgs) {
	const reqData = await request.clone().json();
	const network = (reqData as { params: [BitcoinNetworkType] }).params[0];

	if (!network || !validNetworks.includes(network)) {
		throw new Error("Invalid network type");
	}

	const ctrl = new ReserveController(network);
	return ctrl.handleJsonRPC(request);
}

export default function ReserveDashboardPage() {
	return (
		<div className="flex justify-center py-4 md:px-10">
			<ReserveDashboard />
		</div>
	);
}
