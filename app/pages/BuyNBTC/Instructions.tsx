import { useCurrentAccount } from "@mysten/dapp-kit";

export function Instructions() {
	const account = useCurrentAccount();
	return (
		<div className="card rounded-2xl card-border border md:bg-[url('/assets/bee/bee-with-question-mark.webp')] bg-no-repeat bg-right-bottom bg-[length:min(150px,100%)]">
			<div className="card-body border rounded-lg flex flex-col justify-between p-4">
				<h2 className="mb-2 font-semibold text-gray-900 dark:text-white">Instructions:</h2>
				<ul className="space-y-2 text-gray-500 list-disc list-inside dark:text-gray-400">
					<li>Click on Connect Sui Wallet button, if not already connected.</li>
					<li>Connect your wallet. Slush recommended.</li>
					<li>
						Make sure you have testnet Sui tokens:
						<ul className="ps-8 mt-2 space-y-1 list-disc list-outside">
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
