/**
 * @typedef {object} UTXO
 * @property {string} scriptpubkey - The scriptPubKey (locking script) of the Unspent Transaction Output.
 * @property {string} txid - The transaction ID of the transaction that created this UTXO.
 * @property {number} value - The value of this UTXO in satoshis.
 * @property {number} vout - The output index (vout) within the transaction that created this UTXO.
 */
type UTXO = {
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
type ValidateAddressI = {
	isValid: boolean;
	address: string;
	scriptPubKey: string;
	isscript: boolean;
	iswitness: boolean;
	witness_version: number;
	witness_program: string;
};

interface DApp {
	name: string;
	type: string;
	labels: string[];
	apy: number;
	chain: string;
	logo: string;
}

enum TRANSACTION_STATUS {
	NONE = 0,
	FAILED = 1,
	PENDING = 2,
	FINALIZED = 3,
}

export type { UTXO, ValidateAddressI, DApp, TRANSACTION_STATUS };

// Supported wallets in BYield DApp
export enum ByieldWallet {
	Xverse = "Xverse",
	SuiWallet = "SuiWallet",
}
