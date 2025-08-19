import assert from "node:assert";
import test, { after, before, describe } from "node:test";
// import { describe, test, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { Miniflare } from "miniflare";

describe("worker", () => {
	/**
	 * @type {Miniflare}
	 */
	let worker: Miniflare;

	before(async () => {
		worker = new Miniflare({
			modules: true,
			script: `export default { fetch(request, env) { return new Response("OK"); } }`,
			bindings: {
				FOO: "Hello Bindings",
			},
			kvNamespaces: ["KV2"],
			kvPersist: false,
			d1Persist: false,
			cachePersist: false,
		});
		await worker.ready;
	});
	after(async () => {
		await worker.dispose();
	});

	test("hello world", async () => {
		const bindings = worker.getBindings();
		assert.strictEqual(bindings.FOO, "Hello Bindings");
		// expect(bindings.FOO).toEqual("Hello Bindings");
		//
		// await bindings.KV.put("key", "value");
		// expect(await bindings.KV.get("key")).toEqual("value");
		// assert.strictEqual(
		// 	await (await worker.dispatchFetch("http://example.com")).text(),
		// 	"Hello World",
		// );
	});
});
