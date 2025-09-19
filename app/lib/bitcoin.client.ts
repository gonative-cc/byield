import type { Network } from "bitcoinjs-lib";
import { BitcoinNetworkType } from "sats-connect";

/**
 * Dynamic import for bitcoinjs-lib to avoid SSR issues.
 *
 * The bitcoinjs-lib library depends on Node.js APIs (Buffer, crypto) that aren't available
 * during server-side rendering in Cloudflare Workers. Dynamic imports ensure the library
 * is only loaded client-side when actually needed, preventing SSR build failures.
 *
 * This approach replaces the previous polyfill strategy that used @esbuild-plugins/node-globals-polyfill.
 * See: https://github.com/gonative-cc/byield/issues/335
 */
let bitcoinLib: typeof import("bitcoinjs-lib") | null = null;

export async function getBitcoinLib() {
	if (!bitcoinLib) {
		bitcoinLib = await import("bitcoinjs-lib");
	}
	return bitcoinLib;
}

export async function getBitcoinNetworkConfig(
	network: BitcoinNetworkType,
): Promise<Network | null> {
	const bitcoinjs = await getBitcoinLib();

	switch (network) {
		case BitcoinNetworkType.Mainnet:
			return bitcoinjs.networks.bitcoin;
		case BitcoinNetworkType.Regtest:
			return bitcoinjs.networks.regtest;
		case BitcoinNetworkType.Testnet4:
			return bitcoinjs.networks.testnet;
		default:
			console.error("DEBUG: Unknown network type:", network);
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
