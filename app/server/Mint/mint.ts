import type { BitcoinNetworkType } from "sats-connect";

async function fetchTxHexByTxId(txId: string) {
	const response = await fetch(
		`/api/proxy?service=bitcoin&action=hex&txid=${encodeURIComponent(txId)}`,
	);
	if (!response.ok) {
		if (response.status === 404) {
			return null;
		}
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.text();
}

export async function putNBTCTX(txId: string, network?: BitcoinNetworkType) {
	try {
		const txHex = await fetchTxHexByTxId(txId);
		if (!txHex) {
			throw new Error(`Error fetching tx hex: ${txId}`);
		}
		let url = `/api/proxy?service=indexer&action=putnbtctx&txHex=${encodeURIComponent(txHex)}`;
		if (network) {
			url += `&network=${encodeURIComponent(network)}`;
		}
		const response = await fetch(url);
		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response;
	} catch (error) {
		console.error("Error posting tx hex:", error);
	}
}
