import { Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import { NumericInput, NumericInputProps } from "../ui/NumericInput";
import { classNames } from "~/util/tailwind";

interface FormInputProps extends NumericInputProps {
	name: string;
	createEmptySpace?: boolean;
	rules?: Omit<
		RegisterOptions<FieldValues, string>,
		"disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
	>;
}

export const FormNumericInput = ({
	name,
	required,
	rules,
	createEmptySpace = false,
	...rest
}: FormInputProps) => {
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
				<div>
					<NumericInput value={value} onChange={onChange} {...rest} />
					<div className={classNames({ "min-h-[1.3rem] mt-0.5": createEmptySpace })}>
						{error && <p className="text-sm text-red-500">{error.message}</p>}
					</div>
				</div>
			)}
		/>
	);
};
