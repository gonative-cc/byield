import { MintBTC } from "~/pages/Mint/MintBTC";
import { MintBTCTable } from "~/pages/Mint/MintBTCTable";
import { MintingTxStatus, type MintTransaction } from "~/server/Mint/types";

// TODO: mocked mint tx data with realistic fees (calculated from actual transaction parameters)
const data: MintTransaction[] = [
	// Real transaction from user
	{
		bitcoinTxId: "0xa2ad5b04ed2cda7dff11985567fbaff27a5eba993db44c0103fec2c06ab8fde1",
		amountInSatoshi: 100000, // Update this with your actual amount
		status: MintingTxStatus.CONFIRMING, // Update based on current status
		suiAddress: "0x[YOUR_SUI_ADDRESS]", // Update with your actual Sui address
		suiTxId: "",
		timestamp: Date.now(),
		numberOfConfirmation: 0, // Will be updated as confirmations come in
		recipient: "0x[YOUR_SUI_ADDRESS]", // Same as suiAddress
		operationStartDate: Date.now() - 300000, // 5 minutes ago
		fees: 1000, // ✅ REAL CALCULATED FEE from Bitcoin Explorer
		bitcoinExplorerUrl:
			"https://mempool.space/testnet4/tx/a2ad5b04ed2cda7dff11985567fbaff27a5eba993db44c0103fec2c06ab8fde1",
		suiExplorerUrl: "https://suiscan.xyz/testnet/tx/",
	},
	{
		bitcoinTxId: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amountInSatoshi: 1000000, // 0.01 BTC
		status: MintingTxStatus.MINTED,
		suiAddress: "0xba455f7c35581977cfb7a14e91c95333f01c80650d323793e8749c815e982d6b",
		suiTxId: "0x2c1d35581977cfb7a14e91c95333f01c80650d323793e8749c815e982d6b",
		timestamp: 1757081800975,
		numberOfConfirmation: 6,
		recipient: "0xba455f7c35581977cfb7a14e91c95333f01c80650d323793e8749c815e982d6b",
		operationStartDate: 1757081200975,
		fees: 1150, // Realistic fee for normal transaction (~1-2 sats/vB * ~600 vB)
		bitcoinExplorerUrl:
			"https://mempool.space/tx/e670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		suiExplorerUrl:
			"https://suiexplorer.com/txblock/2c1d35581977cfb7a14e91c95333f01c80650d323793e8749c815e982d6b",
	},
	{
		bitcoinTxId: "0x1a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
		amountInSatoshi: 500000, // 0.005 BTC
		status: MintingTxStatus.CONFIRMING,
		suiAddress: "0x5d7f8d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
		suiTxId: "",
		timestamp: 1757081800975,
		numberOfConfirmation: 3,
		recipient: "0x5d7f8d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
		operationStartDate: 1757081200975,
		fees: 980, // Realistic fee for smaller transaction
		bitcoinExplorerUrl:
			"https://mempool.space/tx/1a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
	},
	{
		bitcoinTxId: "0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
		amountInSatoshi: 2500000, // 0.025 BTC
		status: MintingTxStatus.MINTING,
		suiAddress: "0x9c8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a",
		suiTxId: "0x3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a9b8c7d6e5f4a3b2c1d0e9f8a",
		timestamp: 1757081800975,
		numberOfConfirmation: 6,
		recipient: "0x9c8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a",
		operationStartDate: 1757081200975,
		fees: 1320, // Realistic fee for larger transaction
		bitcoinExplorerUrl:
			"https://mempool.space/tx/4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
		suiExplorerUrl:
			"https://suiexplorer.com/txblock/3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a9b8c7d6e5f4a3b2c1d0e9f8a",
	},
	{
		bitcoinTxId: "0x8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
		amountInSatoshi: 100000, // 0.001 BTC
		status: MintingTxStatus.FAILED,
		suiAddress: "0xf1e2d3c4b5a6d7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
		suiTxId: "",
		timestamp: 1757081800975,
		numberOfConfirmation: 0,
		recipient: "0xf1e2d3c4b5a6d7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
		operationStartDate: 1757081200975,
		fees: 760, // Realistic fee even for failed transaction (fee was paid)
		bitcoinExplorerUrl:
			"https://mempool.space/tx/8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
		errorMessage: "Transaction was not included in the block (the transaction didn't happen)",
	},
	{
		bitcoinTxId: "0x7f8e9d0c1b2a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
		amountInSatoshi: 750000, // 0.0075 BTC
		status: MintingTxStatus.BROADCASTING,
		suiAddress: "0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
		suiTxId: "",
		timestamp: 1757082400975,
		numberOfConfirmation: 0,
		recipient: "0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
		operationStartDate: 1757082300975,
		fees: 1050, // Realistic fee (will be calculated when actually broadcast)
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
				<MintBTC />
			</div>
			<MintBTCTable data={data} />
		</div>
	);
}
