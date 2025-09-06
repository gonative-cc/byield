import type { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import type { Transaction } from "@mysten/sui/transactions";

// Std Sui object addresses
export const SUI_RANDOM_OBJECT_ID = "0x8";

export type TxSigner = (tx: Transaction) => { bytes: string; signature: string };

export async function signAndExecTx(
	transaction: Transaction,
	client: SuiClient,
	signer: TxSigner,
): Promise<SuiTransactionBlockResponse> {
	// TODO: verify if we are using the right chain here (if we switch to mainnet if this is correct)
	// Maybe just rmeove the chain so correct is deterined by wallet and client context
	// The wallet context (dapp-kit) ensures the correct chain/account is used
	//const chain = account?.chains?.[0];
	const { bytes, signature } = await signer({ transaction });

	return await client.executeTransactionBlock({
		transactionBlock: bytes,
		signature,
		options: { showEffects: true, showInput: true },
	});
}
