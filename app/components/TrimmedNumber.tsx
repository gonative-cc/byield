import { NumericFormat } from "react-number-format";
import { Tooltip } from "./ui/tooltip";
import { type NumericFormatProps } from "react-number-format";

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
	let suffix = props.suffix;
	if (props.decimalScale === 0) suffix = "..." + suffix;
	const decimalScale = props.decimalScale === 0 ? 4 : props.decimalScale;

	return (
		<Tooltip tooltip={props.value} className={props.className}>
			<NumericFormat {...props} decimalScale={decimalScale} suffix={suffix} />
		</Tooltip>
	);
}
