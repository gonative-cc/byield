import { useCurrentAccount } from "@mysten/dapp-kit";

export function Instructions() {
	const account = useCurrentAccount();
	return (
		<div className="card card-border bg-base-300 bg-[length:min(150px,100%)] bg-right-bottom bg-no-repeat md:bg-[url('/assets/bee/bee-with-question-mark.webp')]">
			<div className="card-body flex flex-col justify-between p-4">
				<h2 className="text-base-content/75 mb-2 font-semibold">Instructions:</h2>
				<ul className="list-inside list-disc space-y-2">
					<li>Click on Connect Sui Wallet button, if not already connected.</li>
					<li>Connect your wallet. Slush recommended.</li>
					<li>
						Make sure you have testnet Sui tokens:
						<ul className="mt-2 list-outside list-disc space-y-1 ps-8">
							<li>
								<a
									target="_blank"
									href={`https://faucet.sui.io/?network=testnet&address=${account?.address}`}
									rel="noreferrer"
									className="link link-primary"
								>
									Request Sui Tokens from faucet.
								</a>
							</li>
							<li>
								You can also check{" "}
								<a
									target="_blank"
									href="https://docs.sui.io/guides/developer/getting-started/get-coins"
									rel="noreferrer"
									className="link link-primary"
								>
									alternative faucets.
								</a>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	);
}
