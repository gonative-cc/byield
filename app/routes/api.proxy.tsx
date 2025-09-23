import { getBitcoinNetworkConfig } from "~/hooks/useBitcoinConfig";

export async function loader({ request }: { request: Request }) {
	const url = new URL(request.url);
	const service = url.searchParams.get("service");

	if (!service) {
		return Response.json({ error: "Missing required parameter: service" }, { status: 400 });
	}

	try {
		if (service === "bitcoin") {
			return handleBitcoinService(url);
		} else if (service === "indexer") {
			return handleIndexerService(url);
		} else {
			return Response.json({ error: `Unknown service: ${service}` }, { status: 400 });
		}
	} catch (error) {
		console.error(`Error in ${service} service:`, error);
		return Response.json({ error: `Failed to communicate with ${service} service` }, { status: 500 });
	}
}

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

	const regtestConfig = getBitcoinNetworkConfig.Regtest.variables;
	const rpcBase = regtestConfig.btcRPCUrl;

	if (!rpcBase) {
		return Response.json({ error: "Bitcoin RPC URL not configured for regtest" }, { status: 500 });
	}

	let rpcUrl: string;
	switch (action) {
		case "utxos":
			rpcUrl = `${rpcBase}/address/${encodeURIComponent(address!)}/utxo`;
			break;
		case "validate":
			rpcUrl = `${rpcBase}/v1/validate-address/${encodeURIComponent(address!)}`;
			break;
		case "tx":
			rpcUrl = `${rpcBase}/tx/${encodeURIComponent(txid!)}`;
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

async function handleIndexerService(url: URL) {
	const suiRecipient = url.searchParams.get("sui_recipient");
	const bitcoinTxId = url.searchParams.get("bitcoin_tx_id");
	const network = url.searchParams.get("network");

	if (!suiRecipient && !bitcoinTxId) {
		return Response.json(
			{ error: "Missing required parameter: sui_recipient or bitcoin_tx_id" },
			{ status: 400 },
		);
	}

	let indexerBaseUrl: string | null = null;

	if (network) {
		try {
			const networkKey = (network.charAt(0).toUpperCase() +
				network.slice(1).toLowerCase()) as keyof typeof getBitcoinNetworkConfig;
			const networkConfig = getBitcoinNetworkConfig[networkKey];
			indexerBaseUrl = networkConfig?.variables?.indexerUrl || null;
		} catch (error) {
			console.error("Error getting network config:", error);
		}
	}

	if (!indexerBaseUrl) {
		console.error("No indexer URL configured for network:", network);
		return Response.json({ error: `No indexer URL configured for network: ${network}` }, { status: 500 });
	}

	let indexerUrl: string;
	if (bitcoinTxId) {
		indexerUrl = `${indexerBaseUrl}/tx/${encodeURIComponent(bitcoinTxId)}`;
	} else {
		indexerUrl = `${indexerBaseUrl}?sui_recipient=${encodeURIComponent(suiRecipient!)}`;
	}

	const indexerResponse = await fetch(indexerUrl, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": "Byield-Frontend/1.0",
		},
	});

	if (!indexerResponse.ok) {
		const errorText = await indexerResponse.text();
		console.error("Indexer error:", indexerResponse.status, errorText);
		return Response.json(
			{
				error: `Indexer service error: ${indexerResponse.status} ${indexerResponse.statusText}`,
				details: errorText,
			},
			{ status: indexerResponse.status },
		);
	}

	const data = await indexerResponse.json();
	return Response.json(data);
}
