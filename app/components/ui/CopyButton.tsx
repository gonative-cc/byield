import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
	text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<button onClick={handleCopy} className={"hover:bg-primary/10"}>
			{copied ? (
				<Check className="text-success" size={16} />
			) : (
				<Copy size={16} className="text-primary" />
			)}
		</button>
	);
}
