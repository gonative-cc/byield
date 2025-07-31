import type { Network } from "bitcoinjs-lib";
import { opcodes, Psbt, script } from "bitcoinjs-lib";
import type { Address } from "sats-connect";
import { fetchUTXOs, fetchValidateAddress } from "~/api/btcrpc";
import type { UTXO, ValidateAddressI } from "~/api/btcrpc";
import { nBTC_ADDR } from "~/lib/nbtc";

export async function nBTCMintTxn(
	bitcoinAddress: Address,
	sendAmount: number,
	opReturnInput: string,
	network: Network,
) {
	try {
		// fetch utxos
		const utxos: UTXO[] = await fetchUTXOs(bitcoinAddress.address);
		if (!utxos?.length) {
			console.error("utxos not found.");
		}
		// validate address
		const validateAddress: ValidateAddressI = await fetchValidateAddress(
			bitcoinAddress.address,
		);
		if (!validateAddress) {
			console.error("Not able to find validate the address.");
		}
		const psbt = new Psbt({ network });

		psbt.addInput({
			hash: utxos?.[0]?.txid,
			index: utxos?.[0]?.vout,
			witnessUtxo: {
				script: Buffer.from(validateAddress.scriptPubKey, "hex"),
				value: utxos?.[0]?.value,
			},
		});

		psbt.addOutput({
			// TODO: replace hardcoded P2WPKH address for nBTC deposits
			address: nBTC_ADDR,
			value: sendAmount,
		});

		// Add OP_RETURN output
		const opReturnData = Buffer.from(opReturnInput, "hex");
		const opReturnScript = script.compile([opcodes.OP_RETURN, opReturnData]);
		psbt.addOutput({
			script: opReturnScript,
			value: 0,
		});
		const fee = 500;
		const changeAmount = utxos?.[0]?.value - sendAmount - fee;
		if (changeAmount <= 0) {
			console.error("Insufficient funds for transaction and fee.");
		}
		psbt.addOutput({
			address: bitcoinAddress.address,
			value: changeAmount,
		});

		const txHex = psbt.toBase64();
		return txHex;
	} catch (error) {
		console.error(error);
	}
}
