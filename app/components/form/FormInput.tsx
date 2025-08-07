import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, RegisterOptions } from "react-hook-form";
import { Input } from "../ui/input";
import type { InputProps } from "../ui/input";
import { classNames } from "~/util/tailwind";

interface FormInputProps extends InputProps {
	name: string;
	createEmptySpace?: boolean;
	rules?: Omit<
		RegisterOptions<FieldValues, string>,
		"disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
	>;
}

export const FormInput = ({ name, required, rules, createEmptySpace = false, ...rest }: FormInputProps) => {
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
					<div className={classNames({ "min-h-[1.3rem] mt-0.5": createEmptySpace })}>
						{error && <p className="text-sm text-red-500">{error.message}</p>}
					</div>
				</div>
			)}
		/>
	);
};
