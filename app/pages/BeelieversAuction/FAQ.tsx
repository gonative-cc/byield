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
		<div key={key}>
			<h3 className="text-lg font-medium">{question}</h3>
			<p className="text-muted-foreground">{answer}</p>
		</div>
	);

	return (
		<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-700 w-full max-w-4xl">
			<div className="bg-card rounded-lg p-6 border">
				<h2 className="text-2xl font-semibold text-center mb-6">FAQ</h2>
				<div className="flex flex-col gap-2 space-y-6">
					{FAQS.map(({ id, question, answer }) => renderQuestion(id, question, answer))}
				</div>
			</div>
		</div>
	);
}
