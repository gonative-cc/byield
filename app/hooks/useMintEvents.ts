import { useState, useCallback } from "react";
import { queryMintEvents, type MintEvent, type QueryMintEventsResult } from "~/lib/mintEvents";
import { useNetworkVariables } from "~/networkConfig";

export function useMintEvents() {
	const [events, setEvents] = useState<MintEvent[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [nextCursor, setNextCursor] = useState<string | null>(null);

	const { nbtc } = useNetworkVariables();

	const fetchEvents = useCallback(
		async (cursor?: string, limit = 10) => {
			setIsLoading(true);
			setError(null);

			try {
				const result: QueryMintEventsResult = await queryMintEvents({
					cursor,
					limit,
					nbtcPkgId: nbtc.pkgId,
				});

				const sortedEvents = result.events.sort((a, b) => {
					return new Date(b.timestampMs).getTime() - new Date(a.timestampMs).getTime();
				});

				setEvents(cursor ? [...events, ...sortedEvents] : sortedEvents);
				setHasNextPage(result.hasNextPage);
				setNextCursor(result.nextCursor);
			} catch (err) {
				setError(err instanceof Error ? err : new Error("Failed to fetch events"));
			} finally {
				setIsLoading(false);
			}
		},
		[nbtc.pkgId, events],
	);

	const loadMore = useCallback(() => {
		if (hasNextPage && nextCursor && !isLoading) {
			fetchEvents(nextCursor);
		}
	}, [hasNextPage, nextCursor, isLoading, fetchEvents]);

	return { events, isLoading, error, hasNextPage, fetchEvents, loadMore };
}
