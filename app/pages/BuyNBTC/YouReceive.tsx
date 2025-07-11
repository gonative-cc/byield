import { formatSUI } from "~/lib/denoms";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { NBTCIcon } from "~/components/icons";

const PRICE_PER_NBTC_IN_SUI = 25000n;

function calculateYouReceive(mistAmount: bigint): bigint {
	return mistAmount / PRICE_PER_NBTC_IN_SUI;
}

interface YouReceiveProps {
	mistAmount: bigint;
	isSuiWalletConnected: boolean;
}

export function YouReceive({ mistAmount, isSuiWalletConnected }: YouReceiveProps) {
	const youReceive = calculateYouReceive(mistAmount);

	return (
		<div className="flex flex-col gap-2">
			<FormNumericInput
				name="amountOfNBTC"
				className="h-16"
				value={isSuiWalletConnected && youReceive && youReceive > 0 ? formatSUI(youReceive) : "0.0"}
				allowNegative={false}
				placeholder={isSuiWalletConnected && youReceive && youReceive <= 0 ? "0.0" : ""}
				readOnly
				rightAdornments={<NBTCIcon className="mr-5" />}
			/>
			<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
				This is a fixed price buy. The price is 25,000 SUI / nBTC.
			</span>
		</div>
	);
}
