import { NumericFormat } from "react-number-format";
import { BitCoinIcon } from "./icons";
import { formatBTC } from "~/lib/denoms";

interface BitcoinBalanceProps {
	availableBalance: string;
}

export const BitcoinBalance = ({ availableBalance }: BitcoinBalanceProps) => {
	// Convert satoshis to BTC format
	const balanceInBTC = formatBTC(BigInt(availableBalance || "0"));

	return (
		<div className="flex items-center gap-4 bg-white-3 p-3.5 rounded-2xl mb-4">
			<BitCoinIcon />
			<div className="flex flex-col gap-1">
				<span>Available Balance</span>
				<NumericFormat
					displayType="text"
					value={balanceInBTC}
					className="text-gray-400"
					readOnly
					suffix=" BTC"
				/>
			</div>
		</div>
	);
};
