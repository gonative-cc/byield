import { NumericFormat } from "react-number-format";
import { Tooltip } from "./ui/tooltip";
import { type NumericFormatProps } from "react-number-format";

export function TrimmedNumber(props: NumericFormatProps) {
	if (!props.value) return null;

	const numValue = Number(props.value);
	const decimalScale = numValue >= 1 ? 3 : undefined;

	return (
		<Tooltip tooltip={props.value} className={props.className}>
			<NumericFormat {...props} decimalScale={decimalScale} />
		</Tooltip>
	);
}
