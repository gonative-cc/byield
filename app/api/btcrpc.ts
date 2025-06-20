import axios from "axios";

export const MEMPOOL_API = "https://mempool.space/testnet4/api";

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

export async function fetchUTXOs(address: string): Promise<UTXO[]> {
	try {
		// TOOD: maybe other wallet will provide it.
		const response = await axios.get(`${MEMPOOL_API}/address/${address}/utxo`);
		return response.data.map((utxo: UTXO) => ({
			txid: utxo.txid,
			vout: utxo.vout,
			value: utxo.value,
			scriptPubKey: utxo.scriptpubkey,
		}));
	} catch (error) {
		throw new Error(`Failed to fetch UTXOs: ${error}`);
	}
}

export async function fetchValidateAddress(address: string): Promise<ValidateAddressI> {
	try {
		const response = await axios.get(`${MEMPOOL_API}/v1/validate-address/${address}`);
		return response.data;
	} catch (error) {
		throw new Error(`Failed to fetch UTXOs: ${error}`);
	}
}
