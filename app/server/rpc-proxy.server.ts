import { notAuthorized, serverError } from "./http-resp";

export interface RPCConfig {
	authToken: string;
	maxRequests: number;
	windowMs: number;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, config: RPCConfig): boolean {
	const now = Date.now();
	const existing = rateLimitMap.get(ip);

	if (!existing || now > existing.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + config.windowMs });
		return true;
	}

	if (existing.count >= config.maxRequests) return false;

	existing.count++;
	return true;
}

export async function protectedRPCProxy(
	request: Request,
	rpcUrl: string,
	path: string,
	config: RPCConfig,
): Promise<Response> {
	const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";

	if (!checkRateLimit(clientIP, config)) {
		return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
			status: 429,
			headers: { "Content-Type": "application/json" },
		});
	}
	const authHeader = request.headers.get("Authorization");
	if (!authHeader || !authHeader.includes(config.authToken)) {
		return notAuthorized("Unauthorized");
	}

	if (!rpcUrl) {
		return serverError(
			"rpc-proxy:missing-url",
			new Error("RPC URL not configured"),
			"RPC URL not configured",
		);
	}

	const fullUrl = `${rpcUrl}${path}`;

	try {
		const response = await fetch(fullUrl, {
			method: request.method,
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Byield-Server-Proxy/1.0",
			},
			body: request.method !== "GET" ? await request.arrayBuffer() : undefined,
		});

		const contentType = response.headers.get("content-type") || "";

		if (contentType.includes("application/json")) {
			const data = await response.json();
			return new Response(JSON.stringify(data), {
				status: response.status,
				headers: { "Content-Type": "application/json" },
			});
		} else {
			const text = await response.text();
			return new Response(text, {
				status: response.status,
				headers: { "Content-Type": contentType || "text/plain" },
			});
		}
	} catch (error) {
		return serverError("rpc-proxy:request-failed", error, "RPC request failed");
	}
}
