import type { Network, Stack } from "bitcoinjs-lib";
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
			return null;
	}
}

export async function createPsbt(network: Network) {
	const bitcoinjs = await getBitcoinLib();
	return new bitcoinjs.Psbt({ network });
}

export async function compileScript(asm: Uint8Array | Stack) {
	const bitcoinjs = await getBitcoinLib();
	return bitcoinjs.script.compile(asm);
}

export async function getOpReturnOpcode() {
	const bitcoinjs = await getBitcoinLib();
	return bitcoinjs.opcodes.OP_RETURN;
}

export async function getBTCAddrOutputScript(
	address: string,
	network: BitcoinNetworkType,
): Promise<Uint8Array | null> {
	const [bitcoinjs, networkConfig] = await Promise.all([
		getBitcoinLib(),
		getBitcoinNetworkConfig(network),
	]);
	if (!networkConfig) return null;
	return bitcoinjs.address.toOutputScript(address, networkConfig);
}

export async function isValidBitcoinAddress(
	address: string,
	network: BitcoinNetworkType,
): Promise<boolean> {
	try {
		const outputScript = await getBTCAddrOutputScript(address, network);
		if (outputScript) return true;
		return false;
	} catch {
		return false;
	}
}
