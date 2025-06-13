export function isProductionMode(): boolean {
	// MODE is set to simulate production mode
	// PROD=true is set when deplyed for production, rather than local dev.
	return import.meta.env.MODE == "production";
}

export function printAppEnv() {
	console.log("App Env: ", import.meta.env);
}
