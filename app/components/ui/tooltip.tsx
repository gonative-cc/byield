import React from "react";

export function Tooltip({ tooltip, children }: { tooltip: string; children: React.ReactNode }) {
	const [isVisible, setIsVisible] = React.useState(false);

	return (
		<div className="relative group">
			<div
				onTouchStart={() => setIsVisible(!isVisible)}
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
				className="cursor-pointer touch-manipulation"
			>
				{children}
			</div>
			{isVisible && (
				<div className="absolute top-full mt-2 w-max z-10">
					<div className="bg-gray-800 text-white text-sm rounded py-1 px-2">{tooltip}</div>
				</div>
			)}
		</div>
	);
}
