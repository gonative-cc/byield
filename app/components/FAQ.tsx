import type { ReactNode } from "react";

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
		<div
			key={key}
			className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
		>
			<h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">{question}</h3>
			{typeof answer === "string" ? <p className="text-muted-foreground">{answer}</p> : answer}
		</div>
	);

	return (
		<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-700 w-full max-w-5xl bg-card/50 backdrop-blur-sm rounded-2xl p-4 lg:p-8 border border-primary/20 shadow-2xl">
			<div className="text-center mb-6">
				<h2 className="text-3xl font-bold text-primary mb-3">🤔 Frequently Asked Questions</h2>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>
			<div className="space-y-6">
				{faqs.map(({ id, question, answer }) => renderQuestion(id, question, answer))}
			</div>
		</div>
	);
}
