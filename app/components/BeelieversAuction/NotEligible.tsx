import { Link } from "@remix-run/react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { AttemptAuction } from "./AttemptAuction";

function DesktopView() {
	return (
		<Card className="hidden md:block w-[72%]">
			<CardContent className="p-5 rounded-lg text-white flex gap-8 bg-azure-25">
				<img src="/assets/bee/bee-looking-right.svg" alt="bee-with-hammer" />
				<div className="flex gap-8 py-4">
					<div className="flex flex-col gap-2 justify-between">
						<div className="flex justify-between">
							<span className="text-2xl font-bold leading-10">
								Looks like you’re not on the list yet.
								<br />
								Good news? That can change
							</span>
						</div>
						<span className="text-sm">
							Head over to{" "}
							<Link to="/">
								<Button variant="link" className="p-0">
									BYield
								</Button>
							</Link>{" "}
							and perform testnet transaction to access whitelist form.
						</span>
						<span className="text-sm">Auction ends in 00 : 23 :12</span>
					</div>
					<div className="flex flex-col justify-between shrink-0">
						<AttemptAuction className="pt-2" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function MobileView() {
	return (
		<Card className="md:hidden block">
			<CardContent className="p-5 rounded-lg text-white flex flex-col gap-4 bg-azure-25">
				<img src="/assets/bee/bee-with-face-only.svg" alt="bee-with-hammer" />
				<div className="flex gap-2 justify-between">
					<span className="text-xl font-bold leading-8 w-3/4">
						Looks like you’re not on the list yet. Good news? That can change
					</span>
					<AttemptAuction className="self-start align-end pt-2 w-fit" />
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
			</CardContent>
		</Card>
	);
}

export function NotEligible() {
	return (
		<>
			<DesktopView />
			<MobileView />
		</>
	);
}
