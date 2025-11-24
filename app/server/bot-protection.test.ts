import { describe, it, expect } from "vitest";
import { checkBotProtection } from "./bot-protection.server";

function createRequestWithBotMgmt(
	ip: string,
	botScore: number,
	verifiedBot = false,
	staticResource = false,
): Request {
	const request = new Request("https://example.com", {
		headers: {
			"CF-Connecting-IP": ip,
		},
	});
	Object.defineProperty(request, "cf", {
		value: {
			botManagement: {
				score: botScore,
				verifiedBot,
				staticResource,
			},
		},
		configurable: true,
	});
	return request;
}

describe("Bot Protection", () => {
	it("allows normal human requests", () => {
		const request = createRequestWithBotMgmt("192.168.1.1", 85);

		const result = checkBotProtection(request);

		expect(result.allowed).toBe(true);
		expect(result.isBot).toBe(false);
		expect(result.ip).toBe("192.168.1.1");
	});

	it("allows verified bots like Googlebot", () => {
		const request = createRequestWithBotMgmt("192.168.1.1", 1, true);

		const result = checkBotProtection(request);

		expect(result.isBot).toBe(false);
		expect(result.allowed).toBe(true);
	});

	it("allows static resources", () => {
		const request = createRequestWithBotMgmt("192.168.1.1", 1, false, true);

		const result = checkBotProtection(request);

		expect(result.isBot).toBe(false);
		expect(result.allowed).toBe(true);
	});

	it("detects definite bots (score 1)", () => {
		const request = createRequestWithBotMgmt("192.168.1.1", 1);

		const result = checkBotProtection(request);

		expect(result.isBot).toBe(true);
		expect(result.allowed).toBe(true);
	});

	it("detects likely bots (score 2-29)", () => {
		const request = createRequestWithBotMgmt("192.168.1.1", 15);

		const result = checkBotProtection(request);

		expect(result.isBot).toBe(true);
		expect(result.allowed).toBe(true);
	});

	it("does not detect requests with score 30 or higher", () => {
		const request = createRequestWithBotMgmt("192.168.1.1", 30);

		const result = checkBotProtection(request);

		expect(result.isBot).toBe(false);
		expect(result.allowed).toBe(true);
	});

	it("blocks definite bots when enabled", () => {
		const request = createRequestWithBotMgmt("192.168.1.1", 1);

		const result = checkBotProtection(request, true);

		expect(result.allowed).toBe(false);
		expect(result.reason).toBe("Bot traffic not allowed");
		expect(result.isBot).toBe(true);
	});

	it("blocks likely bots when enabled", () => {
		const request = createRequestWithBotMgmt("192.168.1.1", 25);

		const result = checkBotProtection(request, true);

		expect(result.allowed).toBe(false);
		expect(result.reason).toBe("Bot traffic not allowed");
		expect(result.isBot).toBe(true);
	});

	it("uses X-Forwarded-For as fallback", () => {
		const request = new Request("https://example.com", {
			headers: {
				"X-Forwarded-For": "10.0.0.1",
			},
		});

		const result = checkBotProtection(request);

		expect(result.ip).toBe("10.0.0.1");
		expect(result.allowed).toBe(true);
	});

	it("handles missing bot management", () => {
		const request = new Request("https://example.com", {
			headers: {
				"CF-Connecting-IP": "192.168.1.1",
			},
		});

		const result = checkBotProtection(request);

		expect(result.allowed).toBe(true);
		expect(result.ip).toBe("192.168.1.1");
		expect(result.isBot).toBe(false);
	});
});
