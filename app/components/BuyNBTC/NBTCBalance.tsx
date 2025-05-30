import { NumericFormat } from "react-number-format";
import { formatSUI } from "~/lib/denoms";

interface NBTCBalanceProps {
	balance: bigint;
}

export function NBTCBalance({ balance }: NBTCBalanceProps) {
	return (
		<div className="flex items-center gap-4 bg-white-3 p-3.5 rounded-2xl">
			<img src="/nbtc.svg" alt="Bitcoin" className="w-7 h-7" />
			<div className="flex flex-col gap-1">
				<span>Your nBTC Balance</span>
				<NumericFormat
					displayType="text"
					value={formatSUI(balance)}
					className="text-gray-400"
					readOnly
					suffix=" nBTC"
				/>
			</div>
		</div>
	);
}
