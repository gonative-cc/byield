import { describe, test, beforeEach, expect, afterEach } from "vitest";
import { Miniflare } from "miniflare";

// based on
// https://github.com/cloudflare/workers-sdk/blob/main/packages/miniflare/test/index.spec.ts

describe("worker", () => {
	/**
	 * @type {Miniflare}
	 */
	let worker: Miniflare;

	beforeEach(async () => {
		worker = new Miniflare({
			modules: true,
			script: "",
			bindings: {
				FOO: "Hello Bindings",
			},
			kvNamespaces: ["KV2"],
			d1Databases: ["DB"],
			kvPersist: false,
			d1Persist: false,
			cachePersist: false,
		});
		await worker.ready;
	});
	afterEach(async () => {
		await worker.dispose();
	});

	test("test kv", async () => {
		const bindings = await worker.getBindings();
		expect(bindings.FOO).toEqual("Hello Bindings");

		// we can use worker.getKVNamespace("KV2") or bindings.KV2
		// let kv = await worker.getKVNamespace("KV2");
		const kv = bindings.KV2 as KVNamespace;
		await kv.put("key", "value");
		expect(await kv.get("key")).toEqual("value");
	});

	test("test-db", async () => {
		// const bindings = worker.getBindings();
		// const db = bindings.DB as D1Database;
		const db = await worker.getD1Database("DB");
		await db.exec("DROP TABLE IF EXISTS bids;");
		await db.exec("CREATE TABLE bids (bidder TEXT PRIMARY KEY);");
		const stmt = db.prepare("INSERT INTO bids (bidder) VALUES (?)");
		const result = await stmt.bind("Robert").run();
		expect(result.success).toBe(true);

		const b = await db
			.prepare("SELECT * FROM bids WHERE bidder = ?")
			.bind("Robert")
			.first<{ bidder: string }>();
		expect(b).toEqual({ bidder: "Robert" });
	});
});
