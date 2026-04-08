import { describe, it, expect, vi } from "vitest";
import handleRequest from "./entry.server";
import type { AppLoadContext, EntryContext } from "react-router";

// Mock dependencies
vi.mock("react-dom/server", () => ({
	renderToReadableStream: vi.fn(() =>
		Promise.resolve({
			allReady: Promise.resolve(),
		}),
	),
}));

vi.mock("isbot", () => ({
	isbot: vi.fn(() => false),
}));

vi.mock("~/lib/log", () => ({
	logError: vi.fn(),
}));

function createRequest(ipCountry?: string, ipRegion?: string, userAgent?: string): Request {
	const headers: Record<string, string> = {};
	if (ipCountry) headers["cf-ipcountry"] = ipCountry;
	if (ipRegion) headers["cf-region"] = ipRegion;
	if (userAgent) headers["user-agent"] = userAgent;

	return new Request("https://example.com", { headers });
}

const mockRouterContext: EntryContext = {
	isSpaMode: false,
} as EntryContext;

const mockResponseHeaders = new Headers();
const appLoadContext = {} as AppLoadContext;

describe("Sanction Logic", () => {
	it("allows requests from non-sanctioned countries", async () => {
		const request = createRequest("US");

		const response = await handleRequest(
			request,
			200,
			mockResponseHeaders,
			mockRouterContext,
			appLoadContext,
		);

		expect(response.status).toBe(200);
	});

	it("blocks requests from sanctioned countries", async () => {
		const request = createRequest("RU");

		const response = await handleRequest(
			request,
			200,
			mockResponseHeaders,
			mockRouterContext,
			appLoadContext,
		);

		expect(response.status).toBe(403);
		expect(await response.text()).toBe("Access denied: location restricted");
	});

	it("blocks requests from sanctioned regions", async () => {
		const request = createRequest("UA", "Crimea");

		const response = await handleRequest(
			request,
			200,
			mockResponseHeaders,
			mockRouterContext,
			appLoadContext,
		);

		expect(response.status).toBe(403);
		expect(await response.text()).toBe("Access denied: location restricted");
	});

	it("blocks when both country and region are sanctioned", async () => {
		const request = createRequest("RU", "Crimea");

		const response = await handleRequest(
			request,
			200,
			mockResponseHeaders,
			mockRouterContext,
			appLoadContext,
		);

		expect(response.status).toBe(403);
	});

	it("allows requests with no country/region headers", async () => {
		const request = createRequest();

		const response = await handleRequest(
			request,
			200,
			mockResponseHeaders,
			mockRouterContext,
			appLoadContext,
		);

		expect(response.status).toBe(200);
	});

	it("allows requests from non-sanctioned regions in sanctioned countries", async () => {
		const request = createRequest("UA", "Kyiv");

		const response = await handleRequest(
			request,
			200,
			mockResponseHeaders,
			mockRouterContext,
			appLoadContext,
		);

		expect(response.status).toBe(200);
	});
});
