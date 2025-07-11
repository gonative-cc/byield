import { Button } from "~/components/ui/button";


export function Avatar() {
	return (
		<div className="flex flex-col gap-2 items-center">
			<div className="flex flex-col md:flex-row gap-4 items-center">
				<span>1349 whitelisted people put their bid for the auction</span>
			</div>
			<p className="text-gray-400">
				<Button variant="link" className="p-0 underline text-white">
					Connect Wallet
				</Button>{" "}
				to check your eligibility
			</p>
		</div>
	);
}
