import { describe, test, expect, beforeEach } from "vitest";

// based on
// https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/

import { env } from "cloudflare:test";

// import worker from "../workers/app.ts";

describe("Hello World worker", () => {
	const db = env.DB;

	// Use `beforeEach` to ensure a clean data state for every test.
	// Since the database instance is shared across tests, we must reset the tables.
	beforeEach(async () => {
		await db.exec("DROP TABLE IF EXISTS bids;");
	});

	test("responds with Hello World!", async () => {
		const result = await db.exec("CREATE TABLE bids (bidder TEXT PRIMARY KEY);");
		expect(result).toBe(true);
	});
});
