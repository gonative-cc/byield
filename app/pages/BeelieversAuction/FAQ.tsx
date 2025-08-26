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
			className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
		>
			<h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">{question}</h3>
			<p className="text-muted-foreground">{answer}</p>
		</div>
	);

	return (
		<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-700 w-full max-w-5xl">
			<div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 lg:p-8 border border-primary/20 shadow-2xl">
				<div className="text-center mb-6">
					<h2 className="text-3xl font-bold text-primary mb-3">🤔 Frequently Asked Questions</h2>
					<p className="text-muted-foreground">Everything you need to know about Beelievers NFTs</p>
				</div>
				<div className="space-y-6">
					{FAQS.map(({ id, question, answer }) => renderQuestion(id, question, answer))}
				</div>
			</div>
		</div>
	);
}
