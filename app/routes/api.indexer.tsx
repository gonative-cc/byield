import type { Route } from "./+types/api.indexer";

const PRODUCTION_INDEXER_URL = "https://btcindexer.gonative-cc.workers.dev:443/nbtc";

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const suiRecipient = url.searchParams.get("sui_recipient");
	const bitcoinTxId = url.searchParams.get("bitcoin_tx_id");

	if (!suiRecipient && !bitcoinTxId) {
		return Response.json(
			{
				error: "Missing required parameter: sui_recipient or bitcoin_tx_id",
			},
			{ status: 400 },
		);
	}

	try {
		let indexerUrl: string;
		if (bitcoinTxId) {
			indexerUrl = `${PRODUCTION_INDEXER_URL}/tx/${encodeURIComponent(bitcoinTxId)}`;
		} else {
			indexerUrl = `${PRODUCTION_INDEXER_URL}?sui_recipient=${encodeURIComponent(suiRecipient!)}`;
		}

		console.log("🔍 PROXY: Calling production indexer:", indexerUrl);

		const indexerResponse = await fetch(indexerUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Byield-Frontend/1.0",
			},
		});

		console.log("📡 PROXY: Indexer response status:", indexerResponse.status);

		if (!indexerResponse.ok) {
			const errorText = await indexerResponse.text();
			console.error("❌ PROXY: Indexer error:", indexerResponse.status, errorText);
			return Response.json(
				{
					error: `Indexer service error: ${indexerResponse.status} ${indexerResponse.statusText}`,
					details: errorText,
				},
				{ status: indexerResponse.status },
			);
		}

		const data = await indexerResponse.json();
		console.log("✅ PROXY: Successfully fetched data from indexer:", data);

		return Response.json(data);
	} catch (error) {
		console.error("💥 PROXY: Error communicating with indexer:", error);
		return Response.json(
			{
				error: "Failed to communicate with indexer service",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
