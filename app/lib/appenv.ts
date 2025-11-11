export function isProductionMode(): boolean {
	// MODE is set to simulate production mode, and is set with --mode flag
	// PROD=true is set when running react-router build (or vite build).
	return import.meta.env.MODE === "production";
}

import { logger } from "./log";

export function printAppEnv() {
	logger.debug({ msg: "App Env", method: "printAppEnv", env: import.meta.env });
}
