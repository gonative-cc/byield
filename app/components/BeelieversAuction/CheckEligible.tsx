import { Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { AttemptAuction } from "./AttemptAuction";
import { Avatar } from "./Avatar";
import { BeelieversBid } from "./BeelieversBid";
import { NotEligible } from "./NotEligible";
import { Form } from "@remix-run/react";

interface CheckEligibleProps {
	isEligible?: boolean;
}

function DesktopView() {
	return (
		<Card className="hidden md:block w-3/4">
			<CardContent className="p-5 rounded-lg text-white flex gap-8 bg-azure-25">
				<img src="/assets/bee/bee-with-hammer.svg" alt="bee-with-hammer" />
				<div className="flex gap-2 py-4">
					<div className="flex flex-col gap-2 justify-between">
						<div className="flex justify-between">
							<span className="text-2xl font-bold leading-10">
								Participate in <br /> Beelievers Auction
							</span>
						</div>
						<span className="text-sm">
							You bid your true value; winners pay the lowest winning bid. Any amount above the
							clearing price is refunded.
						</span>
						<Form method="POST" action="?check=eligibility">
							<Button type="submit" className="flex w-[163px]">
								<Wallet />
								Check Eligibility
							</Button>
						</Form>
					</div>
					<div className="flex flex-col justify-between shrink-0 pt-2">
						<AttemptAuction />
						<span className="text-sm">Auction ends in 00 : 23 :12</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function MobileView() {
	return (
		<Card className="md:hidden block">
			<CardContent className="p-4 rounded-lg text-white flex flex-col gap-8 bg-azure-25">
				<img src="/assets/bee/bee-with-face-only.svg" alt="bee-with-hammer" />
				<div className="flex w-full justify-between">
					<span className="text-xl font-bold leading-8">Participate in Beelievers Auction</span>
					<AttemptAuction className="self-start pt-2" />
				</div>
				<span className="text-sm self-start">
					You bid your true value; winners pay the lowest winning bid. Any amount above the clearing
					price is refunded.
				</span>
				<div className="flex gap-2 justify-between w-full items-end">
					<Form method="POST" action="?check=eligibility">
						<Button type="submit" className="flex w-[163px]">
							<Wallet />
							Check Eligibility
						</Button>
					</Form>
					<span className="text-sm">Auction ends in 00 : 23 :12</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function CheckEligible({ isEligible }: CheckEligibleProps) {
	const shouldCheckEligibility = isEligible === undefined;
	const isEligibleForAuction = !shouldCheckEligibility && isEligible;

	if (shouldCheckEligibility) {
		return (
			<>
				<DesktopView />
				<MobileView />
				<Avatar />
			</>
		);
	}

	return isEligibleForAuction ? <BeelieversBid /> : <NotEligible />;
}
