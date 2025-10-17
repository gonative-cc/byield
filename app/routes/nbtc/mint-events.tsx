import { useEffect } from "react";
import { useMintEvents } from "~/hooks/useMintEvents";

export default function MintEventsTestPage() {
	const { events, isLoading, hasNextPage, fetchEvents, loadMore } = useMintEvents();

	useEffect(() => {
		fetchEvents(undefined, 10);
	}, []);

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-6 text-3xl font-bold">nBTC Mint Events</h1>

			{isLoading && !events.length ? (
				<div className="flex justify-center py-12">
					<span className="loading loading-spinner loading-lg" />
				</div>
			) : (
				<>
					<div className="stats mb-4 shadow">
						<div className="stat">
							<div className="stat-title">Total Events</div>
							<div className="stat-value">{events.length}</div>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="table-zebra table">
							<thead>
								<tr>
									<th>Recipient</th>
									<th>Amount (sats)</th>
									<th>Fee (sats)</th>
									<th>BTC Tx ID</th>
									<th>Block Height</th>
									<th>Tx Index</th>
									<th>Timestamp</th>
								</tr>
							</thead>
							<tbody>
								{events.map((event, idx) => (
									<tr key={`${event.recipient}-${idx}`}>
										<td className="font-mono text-xs">
											{event.recipient.slice(0, 6)}...{event.recipient.slice(-4)}
										</td>
										<td>{Number(event.amount).toLocaleString()}</td>
										<td>{Number(event.fee).toLocaleString()}</td>
										<td className="font-mono text-xs">{event.btcTxId.slice(0, 8)}...</td>
										<td>{event.btcBlockHeight}</td>
										<td>{event.btcTxIndex}</td>
										<td className="text-xs">
											{new Date(event.timestampMs).toLocaleString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{hasNextPage && (
						<div className="mt-4 text-center">
							<button className="btn btn-primary" onClick={loadMore} disabled={isLoading}>
								{isLoading ? <span className="loading loading-spinner" /> : "Load More"}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
