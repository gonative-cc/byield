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
}

export function FAQ({ faqs, description = "" }: FAQProps) {
	const renderQuestion = (faq: FAQ) => {
		return (
			<div key={faq.id} className={`${orangeInfoCardClasses} collapse-plus collapse border`}>
				<input type="checkbox" />
				<div className="collapse-title text-primary text-lg font-medium">{faq.question}</div>
				<div className="collapse-content">
					{typeof faq.answer === "string" ? (
						<p className="text-foreground">{faq.answer}</p>
					) : (
						faq.answer
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="border-primary/20 w-full max-w-5xl rounded-2xl border p-4 shadow-2xl lg:p-8">
			<div className="mb-6 text-center">
				<h2 className="text-primary mb-3 text-3xl font-bold">🤔 Frequently Asked Questions</h2>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>
			<div className="space-y-4">{faqs.map(renderQuestion)}</div>
		</div>
	);
}
