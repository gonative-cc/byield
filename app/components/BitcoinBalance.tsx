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
		<div className="card card-border bg-base-300">
			<div className="card-body py-4">
				<div className="flex items-center gap-4">
					<BitCoinIcon />
					<div className="flex flex-col">
						<span>Available Balance</span>
						<NumericFormat
							displayType="text"
							value={balanceInBTC}
							className="text-base-content/75"
							readOnly
							suffix=" BTC"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
