import { formatNBTC } from "~/lib/denoms";
import { NBTCIcon } from "./icons";
import { TrimmedNumber } from "./TrimmedNumber";
import { useCoinBalance } from "./Wallet/SuiWallet/useBalance";

export function NBTCBalance() {
	const { balance } = useCoinBalance("NBTC");

	return (
		<div className="bg-base-300 flex items-center gap-4 rounded-2xl p-3.5">
			<NBTCIcon prefix="" className="mr-0" />
			<div className="flex flex-col gap-1">
				<span>Your nBTC Balance</span>
				<TrimmedNumber
					displayType="text"
					value={formatNBTC(balance)}
					className="text-base-content/75"
					readOnly
					suffix=" nBTC"
				/>
			</div>
		</div>
	);
}
