import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Link } from "@remix-run/react";

export function Instructions() {
	const account = useCurrentAccount();
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl md:bg-[url('/assets/ui-icons/instructions_bee.png')] bg-no-repeat bg-right-bottom bg-[length:min(150px,100%)]">
			<CardContent className="flex flex-col justify-between p-0">
				<h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Instructions:</h2>
				<ul className="space-y-2 text-gray-500 list-disc list-inside dark:text-gray-400">
					<li>Click on Connect Sui Wallet button, if not already connected.</li>
					<li>Use the Slush wallet.</li>
					<li>
						Make sure you have testnet Sui tokens:
						<ul className="ps-8 mt-2 space-y-1 list-disc list-outside">
							<li>
								<Link
									target="_blank"
									to={`https://faucet.sui.io/?network=testnet&address=${account?.address}`}
									rel="noreferrer"
								>
									<Button type="button" variant="link" className="p-0 text-base">
										Request Sui Tokens from faucet.
									</Button>
								</Link>
							</li>
							<li>
								You can also check{" "}
								<Link
									target="_blank"
									to="https://docs.sui.io/guides/developer/getting-started/get-coins"
									rel="noreferrer"
								>
									<Button type="button" variant="link" className="p-0 text-base">
										alternative faucets.
									</Button>
								</Link>
							</li>
						</ul>
					</li>
				</ul>
			</CardContent>
		</Card>
	);
}
