import { ChevronsDown, ChevronsUp } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn, collapseGradientClasses } from "~/util/tailwind";

interface CollapseProps {
	title: string | ReactNode;
	children: ReactNode;
	className?: string;
}

export function Collapse({ title, className = "", children }: CollapseProps) {
	const [showInfo, setShowInfo] = useState<boolean>(false);

	return (
		<div
			className={cn(
				"border-primary/20 overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm",
				className,
			)}
		>
			<button
				onClick={() => setShowInfo((prevState) => !prevState)}
				className={collapseGradientClasses}
			>
				{typeof title === "string" ? <span className="font-bold">{title}</span> : title}
				<div className={`transform transition-transform duration-300 group-hover:scale-110`}>
					{showInfo ? <ChevronsUp size={24} /> : <ChevronsDown size={24} />}
				</div>
			</button>
			{showInfo && (
				<div
					className={`p-4 transition-all duration-500 ease-in-out lg:p-6 ${showInfo ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
				>
					{children}
				</div>
			)}
		</div>
	);
}
