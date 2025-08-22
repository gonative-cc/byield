import { test, expect } from "vitest";
import { sortAndCheckDuplicate } from "./batteries";

test("sortAndCheckDuplicate", () => {
	expect(sortAndCheckDuplicate([1, 1])).toBe(true);
	expect(sortAndCheckDuplicate([1, 2, 1])).toBe(true);
	expect(sortAndCheckDuplicate([1, 2, 3, 4, 2])).toBe(true);

	expect(sortAndCheckDuplicate([])).toBe(false);
	expect(sortAndCheckDuplicate([1])).toBe(false);
	expect(sortAndCheckDuplicate([1, 3, 5, 6, 7])).toBe(false);
});
