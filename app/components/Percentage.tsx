export function Percentage({ onChange }: { onChange: (value: number) => void }) {
	const PERCENTAGES = [25, 50, 75, 100];
	return (
		<div className="grid grid-cols-4 gap-2">
			{PERCENTAGES.map((v) => (
				<button
					type="button"
					key={v}
					onClick={() => onChange(v)}
					className="btn btn-sm btn-secondary btn-outline"
				>
					{v}%
				</button>
			))}
		</div>
	);
}
