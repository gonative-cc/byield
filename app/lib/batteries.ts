// Pervasive functions that can be shared across the project

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function cmpNum(a: number, b: number): number {
	return a - b;
}

// sorts array and check for duplicate. Returns true if it contains duplicate
export function sortAndCheckDuplicate(a: number[]): boolean {
	a.sort(cmpNum);
	for (let i = 1; i < a.length; ++i) {
		if (a[i - 1] == a[i]) return true;
	}
	return false;
}

export function removeDuplicates<T>(a: T[]): T[] {
	return [...new Set(a)];
}
