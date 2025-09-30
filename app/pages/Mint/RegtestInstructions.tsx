export function RegtestInstructions() {
	const renderLink = (label: string, url: string) => (
		<a target="_blank" href={url} rel="noreferrer" className="link link-primary">
			{label}
		</a>
	);

	return (
		<ul className="space-y-3 list-decimal list-inside text-base">
			<li>
				{renderLink(
					"Install Xverse Wallet:",
					"https://chromewebstore.google.com/detail/xverse-bitcoin-crypto-wal/idnnbdplmphpflfnlkomgpfbpcgelopg?pli=1",
				)}{" "}
				Download and install the Xverse wallet extension for your browser
			</li>
			<li>
				<strong>Open Xverse Wallet:</strong> Click on the extension to open it.
			</li>
			<li>
				<strong>Navigate to Settings:</strong> On the top right corner, click the ☰ icon and select
				Settings.
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
				following address: http://142.93.46.134:3002
			</li>
			<li>
				<strong>Save:</strong> Press <strong>Save.</strong>
			</li>
			<li>
				<strong>Change the Network:</strong> Now that you have set up the Network, you have to scroll
				down and click on the “Native Devnet” to make sure you have switched over to it.
			</li>
			<li>
				<strong>Get Testnet Tokens:</strong> Now that you have setup the network and switched over to
				it, copy your testnet address and complete the{"  "}
				{renderLink("form", "https://forms.gle/nxSr94kN4BiVpJpx6")} to get BTC.
			</li>
		</ul>
	);
}
