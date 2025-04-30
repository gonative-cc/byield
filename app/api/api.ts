import axios from "axios";
import { MEMPOOL_API } from "~/constants";
import { UTXO, ValidateAddressI } from "~/types";

const fetchUTXOs = async (address: string): Promise<UTXO[]> => {
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
};

const fetchValidateAddress = async (address: string): Promise<ValidateAddressI> => {
	try {
		const response = await axios.get(`${MEMPOOL_API}/v1/validate-address/${address}`);
		return response.data;
	} catch (error) {
		throw new Error(`Failed to fetch UTXOs: ${error}`);
	}
};

export { fetchUTXOs, fetchValidateAddress };
