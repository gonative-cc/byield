export function isProduction(): boolean {
	return import.meta.env.VITE_APP_MODE === "production";
}

export function printAppEnv() {
	console.log("App Env: ", import.meta.env);
}
