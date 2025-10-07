import { describe, it, expect, beforeEach } from "vitest";
import { protectedBitcoinRPC } from "./btc-rpc-proxy";

// Default mock for most tests
const defaultFetch = async (input: RequestInfo | URL) => {
	const url = typeof input === "string" ? input : input.toString();
	if (url.includes("/test-endpoint")) {
		return new Response(JSON.stringify({ success: true, url }), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}
	return new Response("Not found", { status: 404 });
};

describe("Bitcoin RPC Proxy Protection", () => {
	beforeEach(() => {
		global.fetch = defaultFetch;
	});

	it("should allow requests with valid auth token", async () => {
		const request = new Request("http://localhost/", {
			headers: {
				Authorization: "Bearer btc-proxy-secret-2025",
				"CF-Connecting-IP": "127.0.0.1",
			},
		});

		const response = await protectedBitcoinRPC(request, "http://test-rpc", "/test-endpoint");

		expect(response.status).toBe(200);
		const data = (await response.json()) as { success: boolean; url: string };
		expect(data.success).toBe(true);
		expect(data.url).toContain("/test-endpoint");
	});

	it("should block requests without auth token", async () => {
		const request = new Request("http://localhost/", {
			headers: {
				"CF-Connecting-IP": "192.168.1.100",
			},
		});

		const response = await protectedBitcoinRPC(request, "http://test-rpc", "/test-endpoint");

		expect(response.status).toBe(401);
		const data = (await response.json()) as { error: string };
		expect(data.error).toBe("Unauthorized");
	});

	it("should block requests with invalid auth token", async () => {
		const request = new Request("http://localhost/", {
			headers: {
				Authorization: "Bearer wrong-token",
				"CF-Connecting-IP": "192.168.1.100",
			},
		});

		const response = await protectedBitcoinRPC(request, "http://test-rpc", "/test-endpoint");

		expect(response.status).toBe(401);
		const data = (await response.json()) as { error: string };
		expect(data.error).toBe("Unauthorized");
	});

	it("should apply rate limiting (50 requests per 5 minutes)", async () => {
		const ip = `192.168.1.${Math.floor(Math.random() * 255)}`;
		const baseRequest = {
			headers: {
				Authorization: "Bearer btc-proxy-secret-2025",
				"CF-Connecting-IP": ip,
			},
		};
		for (let i = 0; i < 50; i++) {
			const request = new Request("http://localhost/", baseRequest);
			const response = await protectedBitcoinRPC(
				request,
				"http://test-rpc",
				"/test-endpoint",
			);
			expect(response.status).toBe(200);
		}

		const request = new Request("http://localhost/", baseRequest);
		const response = await protectedBitcoinRPC(request, "http://test-rpc", "/test-endpoint");

		expect(response.status).toBe(429);
		const data = (await response.json()) as { error: string };
		expect(data.error).toBe("Rate limit exceeded");
	});

	it("should handle different content types", async () => {
		global.fetch = async () => {
			return new Response("raw-hex-data", {
				status: 200,
				headers: { "content-type": "text/plain" },
			});
		};

		const request = new Request("http://localhost/", {
			headers: {
				Authorization: "Bearer btc-proxy-secret-2025",
				"CF-Connecting-IP": "127.0.0.1",
			},
		});

		const response = await protectedBitcoinRPC(request, "http://test-rpc", "/tx/abc123/hex");

		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toBe("raw-hex-data");
		expect(response.headers.get("content-type")).toBe("text/plain");
	});
});
