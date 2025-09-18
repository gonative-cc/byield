export function RegtestInstructions() {
	const renderLink = (label: string, url: string) => (
		<a target="_blank" href={url} rel="noreferrer" className="link link-primary">
			{label}
		</a>
	);

	const instructions = [
		{
			id: "instruction-1",
			content: renderLink(
				"Install Xverse Wallet",
				"https://chromewebstore.google.com/detail/xverse-bitcoin-crypto-wal/idnnbdplmphpflfnlkomgpfbpcgelopg?pli=1",
			),
		},
		{
			id: "instruction-2",
			content: "Open Xverse wallet",
		},
		{
			id: "instruction-3",
			content: "On top right corner, click on hamburger icon and select Settings",
		},
		{
			id: "instruction-4",
			content: "Click on Network",
		},
		{
			id: "instruction-5",
			content: "Select Regtest as Network",
		},
		{
			id: "instruction-6",
			content: "Click on edit icon on Regtest",
		},
		{
			id: "instruction-7",
			content: "Click on `Change network configuration`",
		},
		{
			id: "instruction-8",
			content: "In the BTC URL, put `http://142.93.46.134:3002`",
		},
		{
			id: "instruction-9",
			content: "Click on Save",
		},
	];

	return (
		<div className="card card-border bg-base-200">
			<div className="card-body">
				<h2 className="card-title">Regtest Configuration for Devnet Server</h2>
				<ul className="space-y-2 list-disc list-inside">
					{instructions.map(({ id, content }) => (
						<li key={id}>{content}</li>
					))}
				</ul>
			</div>
		</div>
	);
}
