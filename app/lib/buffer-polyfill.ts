interface WindowWithBuffer extends Window {
	Buffer?: typeof Buffer;
	global?: typeof globalThis;
}

export function setupBufferPolyfill() {
	if (typeof window !== "undefined") {
		const windowWithBuffer = window as WindowWithBuffer;
		if (!windowWithBuffer.Buffer) {
			import("buffer")
				.then(({ Buffer }) => {
					windowWithBuffer.Buffer = Buffer;
					windowWithBuffer.global = window;
				})
				.catch((error) => {
					console.warn("Failed to load Buffer polyfill:", error);
				});
		}
	}
}
