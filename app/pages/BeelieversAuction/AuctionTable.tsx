import type { CellProps, Column } from "react-table";
import { SUIIcon } from "~/components/icons";
import { Table } from "~/components/ui/table";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { toBadgeRecord, type BadgeRecord } from "~/lib/badgeSystem";
import type { Bidder, User } from "~/server/BeelieversAuction/types";
import { BadgesModal } from "~/components/BadgesModal";
import { formatSUI } from "~/lib/denoms";

const MAX_LEADERBOARD_ROWS = 21;

interface AuctionTableProps {
	data: Bidder[];
	suiAddr: string | null;
	user: User | null;
}

const createColumns = (): Column<Bidder>[] => [
	{
		Header: "🏆 Rank",
		accessor: "rank",
		Cell: ({ value }: CellProps<Bidder>) => (
			<div className="flex items-center gap-2 font-semibold">#{value}</div>
		),
	},
	{
		Header: "👤 Bidder",
		accessor: "bidder",
		Cell: ({ row }: CellProps<Bidder>) => (
			<div className="flex items-center space-x-2">
				<span className="font-mono text-sm">{trimAddress(row.original.bidder)}</span>
			</div>
		),
	},
	{
		Header: "💰 Bid Amount",
		accessor: "amount",
		Cell: ({ row }: CellProps<Bidder>) => (
			<div className="flex items-center space-x-2 font-semibold">
				<SUIIcon prefix="" className="h-5 w-5 text-primary" />
				<span className="text-primary">{formatSUI(row.original.amount)}</span>
				<span className="text-muted-foreground text-sm">SUI</span>
			</div>
		),
	},
	{
		Header: "📝 User Message",
		accessor: "note",
		Cell: ({ row }: CellProps<Bidder>) => (
			<span className="text-sm text-muted-foreground max-w-32 truncate block">
				{row.original.note || "-"}
			</span>
		),
	},
	{
		Header: () => (
			<div className="flex items-center justify-between gap-2 w-full">
				<span className="font-semibold">🏅Badges</span>
				<BadgesModal />
			</div>
		),
		accessor: "badges",
		Cell: ({ row }: CellProps<Bidder>) => {
			const badgeNames = row.original.badges || [];
			const badges = [] as BadgeRecord[];
			for (const b of badgeNames) {
				const bn = toBadgeRecord(b);
				if (bn !== null) badges.push(bn);
			}

			return (
				<div className="flex flex-wrap gap-2 justify-center">
					{badges.length > 0 ? (
						badges.map((badge, index) => (
							<img
								key={index}
								src={badge.src}
								alt={String(badge!.name)}
								className={`bg-orange-500/60 rounded w-8 h-8 hover:scale-110 transition-transform`}
							/>
						))
					) : (
						<span className="text-muted-foreground text-sm">-</span>
					)}
				</div>
			);
		},
	},
];

// TODO: suiAddr is not needed here!
export function AuctionTable({ data, user, suiAddr }: AuctionTableProps) {
	const getDisplayData = (): Bidder[] => {
		const top21: Bidder[] = data.slice(0, MAX_LEADERBOARD_ROWS);
		if (user && suiAddr) {
			const top20: Bidder[] = data
				.slice(0, MAX_LEADERBOARD_ROWS)
				.filter(({ bidder }) => bidder !== suiAddr);
			const currentBidder: Bidder = { ...user, bidder: suiAddr };
			// always show user position at the top of the table
			// total user: 1 + 20
			return [currentBidder, ...top20];
		}
		return top21;
	};

	const displayData = getDisplayData();
	const columns = createColumns();

	const getRowProps = (row: { original: Bidder }) => {
		const isUserRow = row.original.bidder === suiAddr;
		return {
			className: isUserRow
				? "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-l-4 border-primary shadow-lg scale-[1.02] relative z-10 animate-float"
				: "hover:bg-primary/5",
		};
	};

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 pt-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center">
						<span className="text-xl">🏆</span>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-primary">Leaderboard</h2>
						<p className="text-sm text-muted-foreground">Top {MAX_LEADERBOARD_ROWS} bidders</p>
					</div>
				</div>
			</div>
			<Table columns={columns} data={displayData} getRowProps={getRowProps} />
		</div>
	);
}
