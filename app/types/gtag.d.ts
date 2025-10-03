/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Gtag {
	(command: 'config', targetId: string, params?: { [key: string]: any }): void;
	(command: 'set', params: { [key: string]: any }): void;
	(command: 'event', eventName: string, params?: { [key: string]: any }): void;
	(
		command: 'event',
		eventName: string,
		eventParams: {
			event_category?: string;
			event_label?: string;
			value?: number;
			non_interaction?: boolean;
			// Add other gtag parameters as needed
			[key: string]: any; // Allow any other custom parameters
		},
	): void;
	// Add other gtag commands as needed
}

declare global {
	interface Window {
		gtag: Gtag;
	}
}
