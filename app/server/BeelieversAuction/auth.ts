import { verifyTransactionSignature } from "@mysten/sui/verify";
import { TransactionDataBuilder } from "@mysten/sui/transactions";

export async function verifySignature(
	userAddr: string,
	tx_bytes: Uint8Array,
	signature: string,
): Promise<string> {
	await verifyTransactionSignature(tx_bytes, signature, {
		address: userAddr,
	});

	return TransactionDataBuilder.getDigestFromBytes(tx_bytes);
}
