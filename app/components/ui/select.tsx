import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
	optionItemRenderer?: (
		option: Option<T>,
		handleOptionClick: (option: Option<T>) => void,
	) => React.ReactNode;
}

function SelectInput<T = string>({
	options,
	value,
	placeholder,
	onValueChange,
	optionItemRenderer,
	className,
}: SelectInputProps<T>) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleOptionClick = (option: Option<T>) => {
		onValueChange?.(option.value);
		setIsOpen(false);
	};

	return (
		<div
			className={`dropdown ${isOpen ? 'dropdown-open' : ''} ${className || ''}`}
			ref={dropdownRef}
		>
			<button className="btn" onClick={() => setIsOpen(!isOpen)}>
				{selectedOption?.label || placeholder || 'Select option'} <ChevronDown />
			</button>
			{isOpen && (
				<ul className="dropdown-content menu bg-base-100 rounded-box w-full shadow">
					{options.length ? (
						options.map((option) => (
							<li key={String(option.value)}>
								{optionItemRenderer ? (
									optionItemRenderer(option, handleOptionClick)
								) : (
									<button onClick={() => handleOptionClick(option)}>{option.label}</button>
								)}
							</li>
						))
					) : (
						<li>
							<span className="disabled">No options available</span>
						</li>
					)}
				</ul>
			)}
		</div>
	);
}

export { type Option, SelectInput };
