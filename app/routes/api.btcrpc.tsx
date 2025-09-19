import type { Route } from "./+types/api.btcrpc";

const REGTEST_RPC_BASE = "http://142.93.46.134:3002";

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const action = url.searchParams.get("action");
	const address = url.searchParams.get("address");

	if (!action || !address) {
		return Response.json(
			{
				error: "Missing required parameters: action and address",
			},
			{ status: 400 },
		);
	}

	try {
		let rpcUrl: string;

		switch (action) {
			case "utxos":
				rpcUrl = `${REGTEST_RPC_BASE}/address/${encodeURIComponent(address)}/utxo`;
				break;
			case "validate":
				rpcUrl = `${REGTEST_RPC_BASE}/v1/validate-address/${encodeURIComponent(address)}`;
				break;
			default:
				return Response.json(
					{
						error: `Unknown action: ${action}`,
					},
					{ status: 400 },
				);
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
				{
					error: `Bitcoin RPC error: ${rpcResponse.status} ${rpcResponse.statusText}`,
				},
				{ status: rpcResponse.status },
			);
		}

		const data = await rpcResponse.json();
		return Response.json(data);
	} catch (error) {
		console.error("Error communicating with Bitcoin RPC:", error);
		return Response.json(
			{
				error: "Failed to communicate with Bitcoin RPC service",
			},
			{ status: 500 },
		);
	}
}
