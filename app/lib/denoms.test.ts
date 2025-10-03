import { expect, test } from 'vitest';

import * as denoms from './denoms';

class TC {
	input: string;
	dec: number;
	expected: bigint;
	constructor(i: string, d: number, e: bigint) {
		this.input = i;
		this.dec = d;
		this.expected = e;
	}
}

test('parseBTC x formatBTC', () => {
	const testCases: TC[] = [
		new TC('1', 0, BigInt(10 ** 8)),
		new TC('1887', 0, BigInt(10 ** 8 * 1887)),
		new TC('21000000', 0, BigInt(10 ** 8 * 21 * 10 ** 6)),

		new TC('0.00000001', 0, BigInt(1n)),
		new TC('0.00000021', 0, BigInt(21n)),
		new TC('0.00000215', 0, BigInt(215n)),
	];

	testCases.forEach((tc, i) => expect(denoms.parseBTC(tc.input), i.toString()).toBe(tc.expected));

	expect(() => denoms.parseBTC('0.000000001')).toThrowError();
});

test('parse x format', () => {
	const d = 24;
	const n = '1' + '0'.repeat(d);

	const testCases: TC[] = [
		new TC('1', 0, 1n),
		new TC('10', 0, 10n),
		new TC('10.0', 1, 100n),
		new TC('0.1', 1, 1n),
		new TC('1.0', 1, 10n),
		new TC(n, 0, 10n ** BigInt(d)),
		// if decimals!=0; then format appends ".0" for integer numbers
		new TC(n + '.0', 5, 10n ** BigInt(d + 5)),
	];

	testCases.forEach((tc, i) => {
		expect(denoms.parse(tc.input, tc.dec), i.toString()).toBe(tc.expected);
		expect(denoms.formatAmount(tc.expected, tc.dec), i.toString()).toBe(tc.input);
	});

	expect(denoms.parse('-1', 0)).toBe(-1n);
	expect(denoms.parse('-0', 0)).toBe(0n);
	expect(denoms.parse('-.0', 0)).toBe(0n);

	expect(denoms.parse('0.', 1)).toBe(0n);
	expect(denoms.parse('.0', 1)).toBe(0n);
	expect(denoms.parse('0', 1)).toBe(0n);
	expect(() => denoms.parse('.', 0)).toThrowError();

	expect(() => denoms.parse('0.1', 0)).toThrowError();
	expect(() => denoms.parse('0.001', 2)).toThrowError();
	expect(denoms.parse('0.001', 3)).toBe(1n);

	expect(() => denoms.parse('x', 0)).toThrowError();
	expect(() => denoms.parse('xf', 0)).toThrowError();
	expect(() => denoms.parse('0xf', 0)).toThrowError();
	expect(() => denoms.parse('0xf', 0)).toThrowError();
});
