// Client-side only Bitcoin utilities
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bitcoinLibPromise: Promise<any> | null = null;

export async function getBitcoinLib() {
	if (typeof window === "undefined") {
		throw new Error("Bitcoin lib can only be used on client side");
	}

	if (!bitcoinLibPromise) {
		bitcoinLibPromise = import("bitcoinjs-lib");
	}

	return bitcoinLibPromise;
}

export async function getBitcoinNetworkConfig(networkType: ExtendedBitcoinNetworkType) {
	const { networks } = await getBitcoinLib();

	switch (networkType) {
		case ExtendedBitcoinNetworkType.Mainnet:
			return networks.bitcoin;
		case ExtendedBitcoinNetworkType.Regtest:
		case ExtendedBitcoinNetworkType.Devnet:
			return networks.regtest;
		case ExtendedBitcoinNetworkType.Testnet4:
			return networks.testnet;
		default:
			return null;
	}
}
