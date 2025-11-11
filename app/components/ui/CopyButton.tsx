import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { logger } from "~/lib/log";

interface CopyButtonProps {
	text: string;
	size?: number | string;
}

export function CopyButton({ text, size }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const sizeDef = size || "1em";

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		} catch (err) {
			logger.error({ msg: "Failed to copy text", method: "CopyButton", error: err });
		}
	};

	return (
		<button onClick={handleCopy} className={"hover:bg-primary/10"}>
			{copied ? <Check className="text-success" size={sizeDef} /> : <Copy size={sizeDef} />}
		</button>
	);
}
