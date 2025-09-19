import axios from "axios";
import { BitcoinNetworkType } from "sats-connect";

export const MEMPOOL_APIS = {
	Mainnet: "https://mempool.space/api",
	Testnet: "https://mempool.space/testnet/api",
	Testnet4: "https://mempool.space/testnet4/api",
	TestnetV2: "http://142.93.46.134:3002",
	Regtest: "http://142.93.46.134:3002",
};

/**
 * @typedef {object} UTXO
 * @property {string} scriptpubkey - The scriptPubKey (locking script) of the Unspent Transaction Output.
 * @property {string} txid - The transaction ID of the transaction that created this UTXO.
 * @property {number} value - The value of this UTXO in satoshis.
 * @property {number} vout - The output index (vout) within the transaction that created this UTXO.
 */
export type UTXO = {
	scriptpubkey: string;
	txid: string;
	value: number;
	vout: number;
};

/**
 * @typedef {object} ValidateAddressI
 * @property {boolean} isValid - Indicates whether the provided address is considered valid.
 * @property {string} address - The Bitcoin address that was validated.
 * @property {string} scriptPubKey - The corresponding scriptPubKey for the validated address.
 * @property {boolean} isscript - Indicates whether the validated address is a P2SH (Pay-to-Script-Hash) address.
 * @property {boolean} iswitness - Indicates whether the validated address is a SegWit (Segregated Witness) address.
 * @property {number} witness_version - The version number of the SegWit witness program, if it's a SegWit address.
 * @property {string} witness_program - The hexadecimal representation of the SegWit witness program, if it's a SegWit address.
 */
export type ValidateAddressI = {
	isValid: boolean;
	address: string;
	scriptPubKey: string;
	isscript: boolean;
	iswitness: boolean;
	witness_version: number;
	witness_program: string;
};

export async function fetchUTXOs(
	address: string,
	network: BitcoinNetworkType = BitcoinNetworkType.Testnet4,
): Promise<UTXO[]> {
	try {
		if (address.startsWith("bcrt1") || network === BitcoinNetworkType.Regtest) {
			console.log("Fetching real UTXOs from custom regtest network");
			const response = await axios.get(
				`/api/btcrpc?action=utxos&address=${encodeURIComponent(address)}`,
			);
			console.log("Real regtest UTXOs:", response.data);
			return response.data.map((utxo: UTXO) => ({
				txid: utxo.txid,
				vout: utxo.vout,
				value: utxo.value,
				scriptPubKey: utxo.scriptpubkey,
			}));
		}

		const mempoolApi = MEMPOOL_APIS[network as keyof typeof MEMPOOL_APIS];
		if (!mempoolApi) {
			throw new Error(`Unsupported network: ${network}`);
		}
		const response = await axios.get(`${mempoolApi}/address/${address}/utxo`);
		return response.data.map((utxo: UTXO) => ({
			txid: utxo.txid,
			vout: utxo.vout,
			value: utxo.value,
			scriptPubKey: utxo.scriptpubkey,
		}));
	} catch (error) {
		console.error("Failed to fetch UTXOs:", error);
		throw new Error(`Failed to fetch UTXOs for address ${address}`);
	}
}

export async function fetchValidateAddress(address: string): Promise<ValidateAddressI> {
	console.warn(
		"fetchValidateAddress is deprecated. Use client-side validation with bitcoinjs-lib instead.",
	);

	return {
		isValid: true,
		address: address,
		scriptPubKey: "",
		isscript: false,
		iswitness:
			address.startsWith("bc1") || address.startsWith("tb1") || address.startsWith("bcrt1"),
		witness_version: 0,
		witness_program: "",
	};
}
