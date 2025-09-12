import { Select as DaisyUISelect } from "react-daisyui";

interface Option {
	label: string;
	value: string;
}

interface SelectInputProps {
	options: Option[];
	placeholder?: string;
	onValueChange?: (value: string) => void;
	className?: string;
	value?: string;
}

export function SelectInput({ options, value, placeholder, onValueChange }: SelectInputProps) {
	const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		if (onValueChange) onValueChange(event.target.value);
	};

	return (
		<DaisyUISelect value={value || "default"} onChange={handleOnChange}>
			<>
				{placeholder && (
					<DaisyUISelect.Option value="default" disabled>
						{placeholder}
					</DaisyUISelect.Option>
				)}
				{options?.map(({ value, label }) => (
					<DaisyUISelect.Option
						key={value}
						value={value}
						className="text-white md:text-base text-sm"
					>
						{label}
					</DaisyUISelect.Option>
				))}
			</>
		</DaisyUISelect>
	);
}

export type { Option };
