import { NumericFormat } from "react-number-format";
import { BitCoinIcon } from "./icons";

interface BitcoinBalanceProps {
	availableBalance: string;
}

export const BitcoinBalance = ({ availableBalance }: BitcoinBalanceProps) => {
	return (
		<div className="flex items-center gap-4 bg-white-3 p-3.5 rounded-2xl">
			<BitCoinIcon />
			<div className="flex flex-col gap-1">
				<span>Available Balance</span>
				<NumericFormat
					displayType="text"
					value={availableBalance}
					className="text-gray-400"
					readOnly
					suffix=" BTC"
				/>
			</div>
		</div>
	);
};
