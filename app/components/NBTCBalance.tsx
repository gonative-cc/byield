import { NumericFormat } from "react-number-format";
import { formatNBTC } from "~/lib/denoms";
import { NBTCIcon } from "./icons";

interface NBTCBalanceProps {
	balance: bigint;
}

export function NBTCBalance({ balance }: NBTCBalanceProps) {
	return (
		<div className="flex items-center gap-4 bg-white-3 p-3.5 rounded-2xl">
			<NBTCIcon prefix="" className="mr-0" />
			<div className="flex flex-col gap-1">
				<span>Your nBTC Balance</span>
				<NumericFormat
					displayType="text"
					value={formatNBTC(balance)}
					className="text-gray-400"
					readOnly
					suffix=" nBTC"
				/>
			</div>
		</div>
	);
}
