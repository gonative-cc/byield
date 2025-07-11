
import { ReactNode } from "react";
import { Card, CardContent } from "~/components/ui/card";

type Instructions = { id: string; content: string | ReactNode };

interface InstructionsProps {
	heading: string;
	instructions: Instructions[];
}

export function AuctionInstructions({ heading, instructions }: InstructionsProps) {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl">
			<CardContent className="flex flex-col justify-between p-0">
				<h2 className="mb-2 font-semibold text-gray-900 dark:text-white">{heading}:</h2>
				<ul className="space-y-2 text-gray-500 list-disc list-inside dark:text-gray-400">
					{instructions.map(({ id, content }) =>
						typeof content === "string" ? <li key={id}>{content}</li> : content,
					)}
				</ul>
			</CardContent>
		</Card>
	);
}
