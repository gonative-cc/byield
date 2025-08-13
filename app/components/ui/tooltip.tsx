import React from "react";

export function Tooltip({ tooltip, children }: { tooltip: string; children: React.ReactNode }) {
	return (
		<div className="relative group">
			{children}
			<div className="absolute bottom-full mb-2 hidden group-hover:block w-max">
				<div className="bg-gray-800 text-white text-sm rounded py-1 px-2">{tooltip}</div>
			</div>
		</div>
	);
}

export function TooltipButton({ tooltip, text }: { tooltip: string; text: string }) {
	return (
		<Tooltip tooltip={tooltip}>
			<button className="bg-black font-bold py-2 px-4 rounded">{text}</button>
		</Tooltip>
	);
}
