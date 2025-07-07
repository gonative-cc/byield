import { Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { AttemptAuction } from "./AttemptAuction";
import { Avatar } from "./Avatar";
import { BeelieversBid } from "./BeelieversBid";
import { NotEligible } from "./NotEligible";
import { Form } from "react-router";

interface CheckEligibleProps {
	isEligible?: boolean;
}

export function CheckEligible({ isEligible }: CheckEligibleProps) {
	const shouldCheckEligibility = isEligible === undefined;
	const isEligibleForAuction = !shouldCheckEligibility && isEligible;

	if (shouldCheckEligibility) {
		return (
			<>
				<Card className="w-full md:w-[72%]">
					<CardContent className="p-4 rounded-lg text-white flex flex-col md:flex-row gap-4 md:gap-8 bg-azure-25">
						<img
							src="/assets/bee/bee-with-hammer.svg"
							alt="bee-with-hammer"
							className="hidden md:block"
						/>
						<img
							src="/assets/bee/bee-with-face-only.svg"
							alt="bee-with-face-only"
							className="md:hidden block"
						/>
						<div className="flex flex-col md:flex-row gap-2 md:gap-4 py-0 md:py-4 w-full">
							<div className="flex flex-col gap-4 justify-between">
								<div className="flex justify-between gap-2">
									<span className="text-xl md:text-2xl font-bold leading-8 md:leading-10">
										Participate in Beelievers Auction
									</span>
									<div className="flex flex-col justify-between shrink-0 md:hidden">
										<AttemptAuction className="pt-2 self-end" />
									</div>
								</div>
								<span className="text-sm">
									You bid your true value; winners pay the lowest winning bid. Any amount
									above the clearing price is refunded.
								</span>
								<div className="flex gap-2 justify-between w-full items-end">
									<Form method="POST">
										<Button type="submit" className="flex w-[163px]">
											<Wallet />
											Check Eligibility
										</Button>
									</Form>
									<span className="text-sm md:hidden block">
										Auction ends in 00 : 23 :12
									</span>
								</div>
							</div>
							<div className="md:flex flex-col justify-between shrink-0 hidden">
								<AttemptAuction className="pt-2 self-start md:self-end" />
								<span className="text-sm">Auction ends in 00 : 23 :12</span>
							</div>
						</div>
					</CardContent>
				</Card>
				<Avatar />
			</>
		);
	}

	return isEligibleForAuction ? <BeelieversBid /> : <NotEligible />;
}
