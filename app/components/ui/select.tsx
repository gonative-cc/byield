interface Option<T = string> {
	label: string;
	value: T;
}

interface SelectInputProps<T = string> {
	options: Option<T>[];
	placeholder?: string;
	onValueChange?: (value: T) => void;
	className?: string;
	value?: T;
}

function isOptionValueNumberOrString<T>(value: T) {
	return typeof value === "number" || typeof value === "string";
}

function SelectInput<T = string>({ options, value, placeholder, onValueChange }: SelectInputProps<T>) {
	const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		if (onValueChange) {
			const selectedOption = options.find((opt) => {
				const optValue = isOptionValueNumberOrString(opt.value) ? opt.value : String(opt.value);
				return optValue === event.target.value;
			});
			if (selectedOption) onValueChange(selectedOption.value);
		}
	};

	const defaultValue = isOptionValueNumberOrString(value) ? value : String(value);
	const isThereOptions = options.length;

	return (
		<select value={defaultValue || "default"} onChange={handleOnChange} className="select">
			{placeholder && (
				<option value="default" disabled>
					{placeholder}
				</option>
			)}
			{isThereOptions ? (
				options?.map(({ value: optionValue, label }) => (
					<option
						key={String(optionValue)}
						value={isOptionValueNumberOrString(optionValue) ? optionValue : String(optionValue)}
					>
						{label}
					</option>
				))
			) : (
				<option disabled>No options available</option>
			)}
		</select>
	);
}

export { type Option, SelectInput };
