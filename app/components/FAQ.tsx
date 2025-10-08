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
	const renderQuestion = (key: string, question: string, answer: FAQ["answer"]) => (
		<div key={key} className={orangeInfoCardClasses}>
			<h3 className="text-primary mb-3 flex items-center gap-2 text-xl font-semibold">{question}</h3>
			{typeof answer === "string" ? <p className="text-foreground">{answer}</p> : answer}
		</div>
	);

	return (
		<div className="border-primary/20 w-full max-w-5xl rounded-2xl border p-4 shadow-2xl lg:p-8">
			<div className="mb-6 text-center">
				<h2 className="text-primary mb-3 text-3xl font-bold">🤔 Frequently Asked Questions</h2>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>
			<div className="space-y-6">
				{faqs.map(({ id, question, answer }) => renderQuestion(id, question, answer))}
			</div>
		</div>
	);
}
