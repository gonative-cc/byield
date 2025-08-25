import { ChevronsDown, ChevronsUp } from "lucide-react";
import { useState, type ReactNode } from "react";

interface AccordionProps {
	title: string | ReactNode;
	children: ReactNode;
}

export function Collapse({ title, children }: AccordionProps) {
	const [showInfo, setShowInfo] = useState<boolean>(false);

	return (
		<div className="backdrop-blur-sm shadow-lg border border-primary/20 rounded-lg overflow-hidden">
			<button
				onClick={() => setShowInfo((prevState) => !prevState)}
				className="flex items-center justify-between w-full p-4 lg:p-6 text-left bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary hover:text-orange-400 text-lg lg:text-xl transition-all duration-300 group"
			>
				<div className="flex items-center gap-3">
					{typeof title === "string" ? <span className="font-bold">{title}</span> : title}
				</div>
				<div className={`transform transition-transform duration-300 group-hover:scale-110`}>
					{showInfo ? <ChevronsUp size={24} /> : <ChevronsDown size={24} />}
				</div>
			</button>
			<div
				className={`transition-all duration-500 ease-in-out ${showInfo ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
			>
				{showInfo && children}
			</div>
		</div>
	);
}
