import { GRADIENTS } from "~/tailwind";

const FAQS = [
	{
		id: "faq-1",
		question: "Can I trade Beelievers NFTs after the mint?",
		answer: "Yes. After mint, Beelievers NFTs will be available for secondary trading on Tradeport and other supported marketplaces.",
	},
	{
		id: "faq-2",
		question: "What's the total supply?",
		answer: "The Beelievers collection includes 6,021 NFTs.",
	},
];

export function FAQ() {
	const renderQuestion = (key: string, question: string, answer: string) => (
		<div
			key={key}
			className={`${GRADIENTS.primaryInfoCard} border-primary/20 hover:border-primary/40 hover:shadow-primary/10 rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg`}
		>
			<h3 className="text-primary mb-3 flex items-center gap-2 text-xl font-semibold">{question}</h3>
			<p className="text-base-content/75">{answer}</p>
		</div>
	);

	return (
		<div className="animate-in slide-in-from-bottom-4 border-primary/20 w-full max-w-5xl rounded-2xl border p-4 shadow-2xl backdrop-blur-sm delay-700 duration-1000 lg:p-8">
			<div className="mb-6 text-center">
				<h2 className="text-primary mb-3 text-3xl font-bold">🤔 Frequently Asked Questions</h2>
				<p className="text-base-content/75">Everything you need to know about Beelievers NFTs</p>
			</div>
			<div className="space-y-6">
				{FAQS.map(({ id, question, answer }) => renderQuestion(id, question, answer))}
			</div>
		</div>
	);
}
