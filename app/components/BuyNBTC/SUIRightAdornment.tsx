import { SUIIcon } from "../icons";
import { Button } from "../ui/button";

interface SUIRightAdornmentProps {
	maxSUIAmount: string;
	isValidMaxSUIAmount: boolean;
	onMaxClick: (val: string) => void;
}

export function SUIRightAdornment({ isValidMaxSUIAmount, maxSUIAmount, onMaxClick }: SUIRightAdornmentProps) {
	return (
		<div className="flex flex-col items-center gap-2 py-2">
			{isValidMaxSUIAmount && (
				<div className="flex items-center gap-2">
					<p className="text-xs whitespace-nowrap">Balance: {maxSUIAmount.substring(0, 4)} SUI</p>
					<Button
						variant="link"
						type="button"
						onClick={() => onMaxClick(maxSUIAmount)}
						className="text-xs w-fit p-0 pr-2 h-fit"
					>
						Max
					</Button>
				</div>
			)}
			<SUIIcon prefix={"SUI"} className="flex justify-end mr-1" containerClassName="w-full justify-end" />
		</div>
	);
}