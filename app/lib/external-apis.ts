import { BitcoinNetworkType } from "sats-connect";
import { type BitcoinConfig } from "~/hooks/useBitcoinConfig";

export type UTXO = {
	scriptpubkey: string;
	txid: string;
	value: number;
	vout: number;
};

export async function fetchUTXOs(
	address: string,
	network: BitcoinNetworkType,
	cfg: BitcoinConfig,
): Promise<UTXO[]> {
	try {
		if (network === BitcoinNetworkType.Regtest) {
			const res = await fetch(
				`/api/proxy?service=bitcoin&action=utxos&address=${encodeURIComponent(address)}`,
			);
			if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
			const data = await res.json();
			return data as UTXO[];
		}

		const res = await fetch(`${cfg.mempoolApiUrl}/address/${address}/utxo`);
		if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
		const data = await res.json();
		return data as UTXO[];
	} catch (error) {
		console.error("Failed to fetch UTXOs:", error);
		throw new Error(`Failed to fetch UTXOs for address ${address}`);
	}
}
