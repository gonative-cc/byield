const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_PER_MIN = 50;
const AUTH_TOKEN = "btc-proxy-secret-2025";

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const existing = rateLimitMap.get(ip);

	if (!existing || now > existing.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
		return true;
	}

	if (existing.count >= RATE_LIMIT_PER_MIN) return false;

	existing.count++;
	return true;
}

export async function protectedBitcoinRPC(
	request: Request,
	bitcoinRpcUrl: string,
	path: string,
): Promise<Response> {
	const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";

	if (!checkRateLimit(clientIP)) {
		return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
	}
	const authHeader = request.headers.get("Authorization");
	if (!authHeader || !authHeader.includes(AUTH_TOKEN)) {
		console.log(`Blocked unauthorized Bitcoin RPC request from IP: ${clientIP}`);
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!bitcoinRpcUrl) {
		return Response.json({ error: "Bitcoin RPC URL not configured" }, { status: 500 });
	}

	const fullUrl = `${bitcoinRpcUrl}${path}`;

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
			return Response.json(data);
		} else {
			const text = await response.text();
			return new Response(text, {
				status: response.status,
				headers: {
					"Content-Type": contentType || "text/plain",
				},
			});
		}
	} catch (error) {
		console.error("Protected Bitcoin RPC Error:", error);
		return Response.json({ error: "Bitcoin RPC request failed" }, { status: 502 });
	}
}
