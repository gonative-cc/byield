import type { Network } from "bitcoinjs-lib";
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";

// Dynamic import for bitcoinjs-lib to avoid SSR issues
let bitcoinLib: typeof import("bitcoinjs-lib") | null = null;

export async function getBitcoinLib() {
	if (!bitcoinLib) {
		bitcoinLib = await import("bitcoinjs-lib");
	}
	return bitcoinLib;
}

export async function getBitcoinNetworkConfig(
	network: ExtendedBitcoinNetworkType,
): Promise<Network | null> {
	const bitcoinjs = await getBitcoinLib();

	switch (network) {
		case ExtendedBitcoinNetworkType.Mainnet:
			return bitcoinjs.networks.bitcoin;
		case ExtendedBitcoinNetworkType.Regtest:
		case ExtendedBitcoinNetworkType.Devnet:
			return bitcoinjs.networks.regtest;
		case ExtendedBitcoinNetworkType.Testnet4:
			return bitcoinjs.networks.testnet;
		default:
			return null;
	}
}

export async function createPsbt(network: Network) {
	const bitcoinjs = await getBitcoinLib();
	return new bitcoinjs.Psbt({ network });
}

export async function compileScript(asm: (number | Buffer)[]) {
	const bitcoinjs = await getBitcoinLib();
	return bitcoinjs.script.compile(asm);
}

export async function getOpReturnOpcode() {
	const bitcoinjs = await getBitcoinLib();
	return bitcoinjs.opcodes.OP_RETURN;
}
