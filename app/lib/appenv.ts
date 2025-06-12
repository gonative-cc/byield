export type NETWORK = "mainnet" | "testnet";

export function isProduction(): boolean {
	return import.meta.env.VITE_APP_MODE === "production";
}

export function getNetworkMode(): NETWORK {
	return import.meta.env.VITE_APP_NETWORK_MODE;
}

export function printAppEnv() {
	console.log("App Env: ", import.meta.env);
}
