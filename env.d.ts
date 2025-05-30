interface Env {
	VITE_APP_MODE?: string;
}

declare module "cloudflare:env" {
	export interface Env {
		VITE_APP_MODE?: string;
	}
}
