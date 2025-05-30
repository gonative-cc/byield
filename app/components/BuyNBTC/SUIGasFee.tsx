import { NumericFormat } from "react-number-format";
import { formatSUI } from "~/lib/denoms";
import { Card, CardContent } from "../ui/card";

interface SUIGasFeeProps {
	gasFee: bigint;
}

export function SUIGasFee({ gasFee }: SUIGasFeeProps) {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl h-14">
			<CardContent className="flex flex-col justify-between h-full p-0">
				<div className="flex justify-between">
					<p className="text-gray-400 text-sm">Estimated Gas Fee</p>
					<NumericFormat
						displayType="text"
						value={formatSUI(gasFee)}
						suffix=" SUI"
						allowNegative={false}
						className="text-sm"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
