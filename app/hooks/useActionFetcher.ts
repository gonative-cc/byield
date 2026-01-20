import { useFetcher } from "react-router";

interface ActionRequest {
	method: string;
	params: unknown[];
	[key: string]: unknown;
}

/**
 * Generic hook for React Router actions.
 * Eliminates need for useCallback and useMemo wrappers (inspired from https://x.com/eulerfinance/status/2010734949955928472?s=20).
 *
 * Note: `execute` is fire-and-forget. It triggers the action via `fetcher.submit`
 * but does not wait for the response - observe fetcher.state and fetcher.data for updates.
 */
export function useActionFetcher<TData = unknown>() {
	const fetcher = useFetcher<TData>();

	const execute = (req: ActionRequest): void => {
		fetcher.submit(req as never, { method: "POST", encType: "application/json" });
	};

	return {
		execute,
		data: fetcher.data,
		state: fetcher.state,
		isLoading: fetcher.state !== "idle",
		isIdle: fetcher.state === "idle",
	};
}
