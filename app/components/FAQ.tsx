import type { ReactNode } from "react";
import { FAQClassContainer, orangeInfoCardClasses } from "~/tailwind";

interface FAQ {
	id: string;
	question: string;
	answer: string | ReactNode;
}

interface FAQProps {
	title?: string;
	faqs: FAQ[];
	description?: string | ReactNode;
	className?: string;
}

export function FAQ({
	title = "🤔 Frequently Asked Questions",
	faqs,
	description = "",
	className,
}: FAQProps) {
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
		<div className={`${FAQClassContainer} ${className}`}>
			<div className="mb-6 text-center">
				<h2 className="text-primary-foreground mb-3 text-3xl font-bold">{title}</h2>
				{description && <p className="text-base-content/75">{description}</p>}
			</div>
			<div className="text-base-content space-y-4">{faqs.map(renderQuestion)}</div>
		</div>
	);
}
