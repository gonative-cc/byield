import { formatBTC } from "~/lib/denoms";
import { BitCoinIcon } from "./icons";
import { TrimmedNumber } from "./TrimmedNumber";
import { useXverseWallet } from "./Wallet/XverseWallet/useWallet";

export function BTCBalance() {
	const { balance } = useXverseWallet();
	if (!balance) return null;
	return (
		<div className="bg-base-300 flex items-center gap-4 rounded-2xl p-3.5">
			<BitCoinIcon />
			<div className="flex flex-col gap-1">
				<span>Your BTC Balance</span>
				<TrimmedNumber
					displayType="text"
					value={formatBTC(BigInt(balance))}
					className="text-base-content/75"
					readOnly
					suffix=" BTC"
				/>
			</div>
		</div>
	);
}
