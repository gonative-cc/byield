const instructions = [
	"Open Xverse wallet",
	"On top right corner, clikc on hamburger icon and select Settings",
	"Click on Network",
	"Select Regtest as Network",
	"Click on edit icon on Regtest",
	"Click on `Change network configuration`",
	"In the BTC URL, put `http://142.93.46.134:3002`",
	"Click on Save",
];

export function RegtestInstructions() {
	return (
		<div className="card card-border bg-base-200">
			<div className="card-body">
				<h2 className="card-title">Regtest Configuration for Devnet Server</h2>
				<ul className="space-y-2 list-disc list-inside text-primary">
					{instructions.map((instruction, index) => (
						<li key={index}>
							<span className="text-white">{instruction}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
