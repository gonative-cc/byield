interface BitcoinBalanceProps {
	availableBalance: number;
}

export const BitcoinBalance = ({ availableBalance }: BitcoinBalanceProps) => {
	return (
		<div className="flex items-center gap-4 bg-white-3 p-3.5 rounded-2xl">
			<img src="/bitcoin.svg" alt="Bitcoin" className="w-7 h-7" />
			<div className="flex flex-col gap-1">
				<span>Available Balance</span>
				<span className="text-gray-400">{availableBalance} BTC</span>
			</div>
		</div>
	);
};
