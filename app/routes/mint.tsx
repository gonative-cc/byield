import { RegtestInstructions } from "~/pages/Mint/RegtestInstructions";
import { MintBTC } from "~/pages/Mint/MintBTC";
import { MintBTCTable } from "~/pages/Mint/MintBTCTable";
import { Collapse } from "~/components/ui/collapse";
import { MintingTxStatus, type MintTransaction } from "~/server/Mint/types";

// TODO: mocked mint tx data
const data: MintTransaction[] = [
	{
		bitcoinTxId: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amountInSatoshi: 1000000,
		status: MintingTxStatus.MINTED,
		suiAddress: "0xba455f7c35581977cfb7a14e91c95333f01c80650d323793e8749c815e982d6b",
		suiTxId: "0x2c1d35581977cfb7a14e91c95333f01c80650d323793e8749c815e982d6b",
		timestamp: 1757081800975,
		numberOfConfirmation: 1,
	},
	{
		bitcoinTxId: "0x1a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
		amountInSatoshi: 500000,
		status: MintingTxStatus.CONFIRMING,
		suiAddress: "0x5d7f8d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
		suiTxId: "",
		timestamp: 1757081800975,
		numberOfConfirmation: 1,
	},
	{
		bitcoinTxId: "0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
		amountInSatoshi: 2500000,
		status: MintingTxStatus.CONFIRMING,
		suiAddress: "0x9c8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a",
		suiTxId: "0x3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a9b8c7d6e5f4a3b2c1d0e9f8a",
		timestamp: 1757081800975,
		numberOfConfirmation: 1,
	},
	{
		bitcoinTxId: "0x8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
		amountInSatoshi: 100000,
		status: MintingTxStatus.FAILED,
		suiAddress: "0xf1e2d3c4b5a6d7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
		suiTxId: "",
		timestamp: 1757081800975,
		numberOfConfirmation: 1,
	},
];

export default function Mint() {
	return (
		<div className="mx-auto px-4 py-4 space-y-6">
			<div className="text-center space-y-2">
				<span className="text-4xl">
					Mint<span className="text-primary"> nBTC</span>
				</span>
				<p className="text-muted-foreground text-lg">
					Deposit Bitcoin and mint native Bitcoin tokens on Sui network
				</p>
			</div>
			<div className="flex justify-center">
				<div className="w-full max-w-xl space-y-6">
					<Collapse title="Regtest Configuration for Devnet Server" className="bg-base-200">
						<RegtestInstructions />
					</Collapse>
					<MintBTC />
				</div>
			</div>
			<MintBTCTable data={data} />
		</div>
	);
}
