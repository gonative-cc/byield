export function RegtestInstructions() {
	const renderLink = (label: string, url: string) => (
		<a target="_blank" href={url} rel="noreferrer" className="link link-primary">
			{label}
		</a>
	);

	return (
		<>
			<p>
				Bitcoin network is slow and expensive. Bitcoin testnet is not much better. It is hard to
				obtain Bitcoin testnet tokens - often users have to buy them.
			</p>
			<p className="my-3">
				To facilitate good user experience to test Native, we spinned a new Bitcoin network. However,
				this requires wallet configuration that we explained below. The network we created has a
				faster block time (2min instead of 10min)
			</p>
			<p className="my-3">
				<strong>To get testnet tokens complete the setup</strong> below and copy your testnet address
				AFTER and fill the{"  "}
				{renderLink("form", "https://forms.gle/nxSr94kN4BiVpJpx6")} to get BTC.
			</p>

			<ul className="list-inside list-decimal space-y-3 text-base">
				<li>
					{renderLink(
						"Install Xverse Wallet:",
						"https://chromewebstore.google.com/detail/xverse-bitcoin-crypto-wal/idnnbdplmphpflfnlkomgpfbpcgelopg?pli=1",
					)}{" "}
					XXDownload and install the Xverse wallet extension for your browser
				</li>
				<li>
					<strong>Open Xverse Wallet:</strong> Click on the extension to open it.
				</li>
				<li>
					<strong>Navigate to Settings:</strong> On the top right corner, click the ☰ icon and
					select Settings.
				</li>
				<li>
					<strong>Select Network:</strong> Click on Network.
				</li>
				<li>
					<strong>Enable Testnet Mode:</strong> Switch over to On.
				</li>
				<li>
					<strong>Add Network:</strong> Click on the “Add Network” button to add the details of the
					network.
				</li>
				<li>
					<strong>Add Name:</strong> Name it “Native Devnet”.
				</li>
				<li>
					<strong>Add BTC URL:</strong> In the field labeled <strong>BTC URL</strong>, paste the
					following address: <code>https://bitcoin-devnet.gonative.cc</code>
				</li>
				<li>
					<strong>Save:</strong> Press <strong>Save.</strong>
				</li>
				<li>
					<strong>Change the Network:</strong> Now that you have set up the Network, you have to
					scroll down and click on the “Native Devnet” to make sure you have switched over to it.
				</li>
			</ul>
		</>
	);
}
