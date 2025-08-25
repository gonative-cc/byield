import { formatSUI } from "~/lib/denoms";
import { StatsCard } from "./StatsCard";

export function RaffleStats() {
	// TODO: get from server
	const totalRaffleInMist = 5 * 1e9;

	return (
		<div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full max-w-3xl">
			<StatsCard title={formatSUI(BigInt(totalRaffleInMist))}>Total Raffle amount</StatsCard>
		</div>
	);
}
