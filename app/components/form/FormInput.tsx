import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, RegisterOptions } from "react-hook-form";
import { Input } from "../ui/input";
import type { InputProps } from "../ui/input";

interface FormInputProps extends InputProps {
	name: string;
	rules?: Omit<
		RegisterOptions<FieldValues, string>,
		"disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
	>;
}

export const FormInput = ({ name, required, rules, ...rest }: FormInputProps) => {
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
					<Input value={value} onChange={onChange} {...rest} />
					{error && <p className="text-sm text-red-500">{error.message}</p>}
				</div>
			)}
		/>
	);
};
