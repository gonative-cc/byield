import { NumericFormat } from "react-number-format";
import { Tooltip } from "./ui/tooltip";
import { type NumericFormatProps } from "react-number-format";

const FIXED_DECIMAL = 3;

// use decimalScale=0 to set default (0)
export function TrimmedNumber(props: NumericFormatProps) {
	if (
		props.value === null ||
		props.value === undefined ||
		props.value === "" ||
		((typeof props.value === "bigint" || typeof props.value === "number") && props.value !== 0) ||
		isNaN(Number(props.value))
	) {
		return null;
	}
	const numValue = Number(props.value);
	const decimalScale = numValue >= 1 ? FIXED_DECIMAL : undefined;

	return (
		<Tooltip tooltip={props.value} className={props.className}>
			<NumericFormat {...props} decimalScale={decimalScale} />
		</Tooltip>
	);
}
