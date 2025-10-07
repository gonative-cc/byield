import { NumericFormat } from "react-number-format";
import { Tooltip } from "./ui/tooltip";
import { type NumericFormatProps } from "react-number-format";

export function TrimmedNumber(props: NumericFormatProps) {
	if (!props.value) return null;

	return (
		<Tooltip tooltip={props.value} className={props.className}>
			<NumericFormat {...props} decimalScale={3} />
		</Tooltip>
	);
}
