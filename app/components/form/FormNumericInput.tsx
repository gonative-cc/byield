import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, RegisterOptions } from "react-hook-form";
import { NumericInput } from "../ui/NumericInput";
import type { NumericInputProps } from "../ui/NumericInput";

interface FormInputProps extends NumericInputProps {
	name: string;
	rules?: Omit<
		RegisterOptions<FieldValues, string>,
		"disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
	>;
}

export const FormNumericInput = ({ name, required, rules, ...rest }: FormInputProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			rules={{
				required: required ? "*Required" : false,
				...rules,
			}}
			render={({ field: { onChange, value }, fieldState: { error } }) => (
				<div className="space-y-1">
					<NumericInput value={value} onChange={onChange} {...rest} />
					{error && <p className="text-sm text-red-500">{error.message}</p>}
				</div>
			)}
		/>
	);
};
