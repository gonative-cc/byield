import { expect, test } from "vitest";

import * as validate from "./validate";

test("url", () => {
	const positiveCases = [
		"https://example.com",
		"https://sub.domain.co.uk:8080/path?q=1#hash",
		"ftp://files.example.org/resource.txt",
		"http://localhost:3000",
		"https://192.168.1.10",
		"https://user:pass@example.com",
	];
	for (const tc of positiveCases) expect(validate.url(tc), tc).toBe(true);

	const negativeCases = [
		"not-a-url",
		"http://",
		"https://",
		"//missing-protocol.com",
		"https:// space.com",
		"ht!tp://bad-scheme.com",
		"",
		null,
		undefined,
		123,
		{},
	];
	for (const tc of negativeCases) {
		const tcCasted = tc as string;
		expect(validate.url(tcCasted), String(tc)).toBe(false);
	}
});
