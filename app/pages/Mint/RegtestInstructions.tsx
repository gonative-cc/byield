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
			content: "On top right corner, click on ☰ icon and select Settings",
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
			content: "Click on ⋮ icon on Regtest",
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
			content: "Press Save",
		},
	];

	return (
		<ul className="space-y-3 list-disc list-inside text-base">
			{instructions.map(({ id, content }) => (
				<li key={id}>{content}</li>
			))}
		</ul>
	);
}
