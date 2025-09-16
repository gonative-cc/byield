import type {
	SuiClient,
	SuiTransactionBlockResponse,
	SuiTransactionBlockResponseOptions,
} from "@mysten/sui/client";
import type { Transaction } from "@mysten/sui/transactions";
import type { ContractsCfg } from "~/config/sui/contracts-config";

// Std Sui object addresses
export const SUI_RANDOM_OBJECT_ID = "0x8";

export type TxSigner = ({ transaction }: { transaction: Transaction }) => Promise<{
	bytes: string;
	signature: string;
}>;

const defaultExecOptions: SuiTransactionBlockResponseOptions = {
	showEvents: true,
	// showEvents, showInput, showObjectChanges, showEffects (this shows all changes, gas etc...)
};

// By default only the events are show. Activate other options if you want to see objects
export async function signAndExecTx(
	transaction: Transaction,
	client: SuiClient,
	signer: TxSigner,
	options?: SuiTransactionBlockResponseOptions,
): Promise<SuiTransactionBlockResponse> {
	// TODO: verify if we are using the right chain here (if we switch to mainnet if this is correct)
	// Maybe just rmeove the chain so correct is deterined by wallet and client context
	// The wallet context (dapp-kit) ensures the correct chain/account is used
	//const chain = account?.chains?.[0];
	const { bytes, signature } = await signer({ transaction });

	return await client.executeTransactionBlock({
		transactionBlock: bytes,
		signature,
		options: Object.assign({}, defaultExecOptions, options),
	});
}

/**
 * Creates a SuiVision URL for the given object ID using the configured explorer URL
 */
export function mkSuiVisionUrl(objectId: string, cfg: ContractsCfg): string {
	return `${cfg.explorer}/object/${objectId}`;
}

/**
 * Creates a Walrus image URL, handling both full URLs and blob IDs
 */
export function mkWalrusImageUrl(imageUrl: string): string {
	if (imageUrl.startsWith("http")) {
		return imageUrl;
	}
	return `https://walrus.tusky.io/${imageUrl}`;
}
