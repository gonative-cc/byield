import { Link } from "react-router";
import { AttemptAuction } from "./AttemptAuction";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export function NotEligible() {
	return (
		<Card className="w-full md:w-[72%]">
			<CardContent className="p-4 rounded-lg text-white flex flex-col md:flex-row gap-4 md:gap-8 bg-azure-25">
				<img
					src="/assets/bee/bee-looking-right.svg"
					alt="bee-with-hammer"
					className="hidden md:block"
				/>
				<img
					src="/assets/bee/bee-with-face-only.svg"
					alt="bee-with-hammer"
					className="md:hidden block"
				/>
				<div className="flex flex-col md:flex-row gap-2 md:gap-8 py-0 md:py-4 w-full">
					<div className="flex flex-col gap-4 justify-between">
						<div className="flex justify-between gap-2">
							<span className="text-xl md:text-2xl font-bold leading-8 md:leading-10">
								Looks like you’re not on the list yet. Good news? That can change
							</span>
							<div className="flex flex-col justify-between shrink-0 md:hidden">
								<AttemptAuction className="pt-2 self-start md:self-auto" />
							</div>
						</div>
						<span className="text-sm">
							Head over to{" "}
							<Link to="/">
								<Button variant="link" className="p-0 m-0">
									BYield
								</Button>
							</Link>{" "}
							and perform testnet transaction to access whitelist form.
						</span>
						<span className="text-sm">Auction ends in 00 : 23 :12</span>
					</div>
					<div className="md:flex flex-col justify-between shrink-0 hidden">
						<AttemptAuction className="pt-2 self-start md:self-auto" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
