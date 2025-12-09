import type { ReactNode } from "react";
import { orangeInfoCardClasses } from "~/util/tailwind";

interface FAQ {
	id: string;
	question: string;
	answer: string | ReactNode;
}

interface FAQProps {
	faqs: FAQ[];
	description?: string;
	className?: {
		container?: string;
	};
}

export function FAQ({ faqs, description = "", className }: FAQProps) {
	const renderQuestion = (faq: FAQ) => {
		return (
			<div key={faq.id} className={`${orangeInfoCardClasses} collapse-plus collapse`}>
				<input type="checkbox" />
				<div className="collapse-title text-lg font-medium">{faq.question}</div>
				<div className="collapse-content">
					{typeof faq.answer === "string" ? <p>{faq.answer}</p> : faq.answer}
				</div>
			</div>
		);
	};

	return (
		<div
			className={`border-primary/20 w-full max-w-5xl rounded-2xl border p-4 shadow-2xl lg:p-8 ${className?.container}`}
		>
			<div className="mb-6 text-center">
				<h2 className="text-primary-foreground mb-3 text-3xl font-bold">
					🤔 Frequently Asked Questions
				</h2>
				{description && <p className="text-base-content/75">{description}</p>}
			</div>
			<div className="text-base-content space-y-4">{faqs.map(renderQuestion)}</div>
		</div>
	);
}
