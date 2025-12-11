import { BitCoinIcon, NBTCIcon } from "~/components/icons";
import { TrimmedNumber } from "~/components/TrimmedNumber";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { formatBTC, formatNBTC } from "~/lib/denoms";

export function BalanceCard() {
	const { balance } = useXverseWallet();
	const nbtcBalanceRes = useCoinBalance("NBTC");

	if (!nbtcBalanceRes || !balance) return null;

	return (
		<div className="mx-auto flex min-w-1/2 flex-col space-y-2">
			<span className="mb-4 text-center">Your balance</span>
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-2">
					<BitCoinIcon /> BTC
				</div>
				<div className="flex flex-col gap-1">
					<TrimmedNumber
						displayType="text"
						value={formatBTC(BigInt(balance))}
						className="text-muted-foreground"
						readOnly
					/>
				</div>
			</div>
			<div className="divider" />
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-2">
					<NBTCIcon prefix="" /> nBTC
				</div>
				<div className="flex flex-col gap-1">
					<TrimmedNumber
						displayType="text"
						value={formatNBTC(BigInt(nbtcBalanceRes.balance))}
						className="text-muted-foreground"
						readOnly
					/>
				</div>
			</div>
		</div>
	);
}
