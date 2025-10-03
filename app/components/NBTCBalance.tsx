import { NumericFormat } from 'react-number-format';
import { formatNBTC } from '~/lib/denoms';
import { NBTCIcon } from './icons';

interface NBTCBalanceProps {
	balance: bigint;
}

export function NBTCBalance({ balance }: NBTCBalanceProps) {
	return (
		<div className="bg-base-300 flex items-center gap-4 rounded-2xl p-3.5">
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
