import React from "react";

export function Tooltip({ tooltip, children }: { tooltip: string; children: React.ReactNode }) {
	const [isVisible, setIsVisible] = React.useState(false);

	return (
		<div className="group relative">
			<div
				onTouchStart={() => setIsVisible(!isVisible)}
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
				className="cursor-pointer touch-manipulation"
			>
				{children}
			</div>
			{isVisible && (
				<div className="absolute top-full z-10 mt-2 w-max">
					<div className="rounded bg-gray-800 px-2 py-1 text-sm text-white">{tooltip}</div>
				</div>
			)}
		</div>
	);
}
