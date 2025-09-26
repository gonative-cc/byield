import { BitcoinNetworkType } from "sats-connect";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";

export async function loader({ request }: { request: Request }) {
	const url = new URL(request.url);
	const service = url.searchParams.get("service");

	if (!service) {
		return Response.json({ error: "Missing required parameter: service" }, { status: 400 });
	}

	try {
		if (service === "bitcoin") {
			return handleBitcoinService(url);
		} else {
			return Response.json({ error: `Unknown service: ${service}` }, { status: 400 });
		}
	} catch (error) {
		console.error(`Error in ${service} service:`, error);
		return Response.json({ error: `Failed to communicate with ${service} service` }, { status: 500 });
	}
}

// TODO: use RPC as we use in auction
async function handleBitcoinService(url: URL) {
	const action = url.searchParams.get("action");
	const address = url.searchParams.get("address");
	const txid = url.searchParams.get("txid");

	if (!action) {
		return Response.json({ error: "Missing required parameter: action" }, { status: 400 });
	}

	if (action === "tx" && !txid) {
		return Response.json({ error: "Missing required parameter: txid for tx action" }, { status: 400 });
	}

	if ((action === "utxos" || action === "validate") && !address) {
		return Response.json(
			{ error: "Missing required parameter: address for address actions" },
			{ status: 400 },
		);
	}

	// TODO: network name should come as a parameter.
	// + properly handle case where network is not supported
	const regtestConfig = mustGetBitcoinConfig(BitcoinNetworkType.Regtest);
	const bitcoinRpcUrl = regtestConfig.btcRPCUrl;

	let rpcUrl: string;
	switch (action) {
		case "utxos":
			rpcUrl = `${bitcoinRpcUrl}/address/${encodeURIComponent(address!)}/utxo`;
			break;
		case "validate":
			rpcUrl = `${bitcoinRpcUrl}/v1/validate-address/${encodeURIComponent(address!)}`;
			break;
		case "tx":
			rpcUrl = `${bitcoinRpcUrl}/tx/${encodeURIComponent(txid!)}`;
			break;
		default:
			return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
	}

	const rpcResponse = await fetch(rpcUrl, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": "Byield-Server/1.0",
		},
	});

	if (!rpcResponse.ok) {
		console.error("Bitcoin RPC responded with error:", rpcResponse.status, rpcResponse.statusText);
		return Response.json(
			{ error: `Bitcoin RPC error: ${rpcResponse.status} ${rpcResponse.statusText}` },
			{ status: rpcResponse.status },
		);
	}

	const data = await rpcResponse.json();
	return Response.json(data);
}
