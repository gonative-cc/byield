interface TabContentProps {
	children: React.ReactNode;
}

export function TabContent({ children }: TabContentProps) {
	return (
		<div className="tab-content py-6">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{children}</div>
		</div>
	);
}

interface TabHeaderProps {
	title: string;
	checked?: boolean;
}

export function TabHeader({ title, checked = false }: TabHeaderProps) {
	return (
		<input
			type="radio"
			name="tab_proof_of_reserve"
			className="tab checked:bg-primary rounded-full"
			aria-label={title}
			defaultChecked={checked}
		/>
	);
}
