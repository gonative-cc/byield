// Note: The current implementation:
// - doesn't handle scientific notation
// - leading . is ignored. So .5 is 5
// - sign followed by a symbol (eg $) is ignore, so -$1 is 1
export function extractFirstNumber(str: string): number | null {
	const match = str.match(/-?\d+(?:\.\d+)?/);
	if (match) {
		return parseFloat(match[0]);
	}

	return null;
}

export function extractFirstInteger(str: string): number | null {
	const match = str.match(/-?\d+/);
	if (match) {
		return parseInt(match[0], 10);
	}

	return null;
}
