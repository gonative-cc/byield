import { verifyTransactionSignature } from "@mysten/sui/verify";
import { TransactionDataBuilder } from "@mysten/sui/transactions";

// Returns null on verification failure
export async function verifySignature(
	userAddr: string,
	tx_bytes: Uint8Array,
	signature: string,
): Promise<string | null> {
	try {
		// throws exception on tx verification:
		// https://github.com/MystenLabs/ts-sdks/blob/main/packages/typescript/src/verify/verify.ts
		// return pub key
		await verifyTransactionSignature(tx_bytes, signature, {
			address: userAddr,
		});

		return TransactionDataBuilder.getDigestFromBytes(tx_bytes);
	} catch (e) {
		return null;
	}
}
