import { BitcoinNetworkType } from "sats-connect";
import { mustGetBitcoinConfig, type BitcoinConfig } from "~/hooks/useBitcoinConfig";

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
		case "hex":
			rpcUrl = `${bitcoinRpcUrl}/tx/${encodeURIComponent(txid!)}/hex`;
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

	if (action === "hex") {
		return await rpcResponse.text();
	}
	const data = await rpcResponse.json();
	return Response.json(data);
}

async function handleIndexerService(url: URL) {
	const suiRecipient = url.searchParams.get("sui_recipient");
	const bitcoinTxId = url.searchParams.get("bitcoin_tx_id");
	const network = url.searchParams.get("network");
	const action = url.searchParams.get("action");
	const txHex = url.searchParams.get("txHex");

	let nbtcUrl: string;
	try {
		let indexerUrl = mustGetBitcoinConfig(network as BitcoinNetworkType).indexerUrl;
		if (indexerUrl.endsWith("/")) indexerUrl = indexerUrl.slice(0, -1);
		nbtcUrl = indexerUrl + "/nbtc";
	} catch (error) {
		console.error(error);
		// TODO: use standard functions to handle errors
		return Response.json({ error: `No indexer URL configured for network: ${network}` }, { status: 500 });
	}

	// TODO: we should use btcindexer/api client here, rather than making the requests ourselves.

	// TODO: rename the action, this is post
	// in general, we should use the RPC as we do in auction server
	if (action === "putnbtctx") {
		const indexerResponse = await fetch(nbtcUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "BYield/1.0",
			},
			body: JSON.stringify({
				txHex,
			}),
		});
		return indexerResponse;
	}

	if (!suiRecipient && !bitcoinTxId) {
		return Response.json(
			{ error: "Missing required parameter: sui_recipient or bitcoin_tx_id" },
			{ status: 400 },
		);
	}

	const reqUrl = bitcoinTxId
		? `${nbtcUrl}/tx/${encodeURIComponent(bitcoinTxId)}`
		: `${nbtcUrl}?sui_recipient=${encodeURIComponent(suiRecipient!)}`;

	const indexerResponse = await fetch(reqUrl, {
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
