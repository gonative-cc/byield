import { Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import { Input, InputProps } from "../ui/input";

interface FormInputProps extends InputProps {
	name: string;
	rules?:
		| Omit<
				RegisterOptions<FieldValues, string>,
				"disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
		  >
		| undefined;
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
				<div>
					<Input value={value} onChange={onChange} {...rest} />
					{error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
				</div>
			)}
		/>
	);
};
