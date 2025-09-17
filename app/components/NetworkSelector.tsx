import { useState } from "react";
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";

interface NetworkSelectorProps {
	currentNetwork: ExtendedBitcoinNetworkType;
	onNetworkChange: (network: ExtendedBitcoinNetworkType) => void;
}

const NETWORK_OPTIONS = [
	{ value: ExtendedBitcoinNetworkType.Testnet4, label: "Testnet4 (Xverse Default)" },
	{ value: ExtendedBitcoinNetworkType.TestnetV2, label: "TestnetV2 (nBTC Indexer)" },
	{ value: ExtendedBitcoinNetworkType.Devnet, label: "Devnet" },
	{ value: ExtendedBitcoinNetworkType.Mainnet, label: "Mainnet" },
];

export function NetworkSelector({ currentNetwork, onNetworkChange }: NetworkSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);

	const currentOption = NETWORK_OPTIONS.find((option) => option.value === currentNetwork);

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="btn btn-sm btn-outline flex items-center gap-2"
			>
				<span className="text-sm">🌐</span>
				<span className="text-sm">{currentOption?.label || "Select Network"}</span>
				<svg
					className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-1 w-64 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50">
					<div className="p-2">
						{NETWORK_OPTIONS.map((option) => (
							<button
								key={option.value}
								onClick={() => {
									onNetworkChange(option.value);
									setIsOpen(false);
								}}
								className={`w-full text-left p-2 rounded hover:bg-base-200 transition-colors ${
									currentNetwork === option.value ? "bg-base-200 font-medium" : ""
								}`}
							>
								<div className="text-sm">{option.label}</div>
								{option.value === ExtendedBitcoinNetworkType.TestnetV2 && (
									<div className="text-xs text-base-content/60 mt-1">
										2 min blocks, 3 confirmations
									</div>
								)}
								{option.value === ExtendedBitcoinNetworkType.Testnet4 && (
									<div className="text-xs text-base-content/60 mt-1">
										10 min blocks, 6 confirmations
									</div>
								)}
							</button>
						))}
					</div>

					<div className="border-t border-base-300 p-3">
						<div className="text-xs text-base-content/60">
							<div className="font-medium mb-1">ℹ️ Network Info:</div>
							<div>
								• Wallet stays on{" "}
								{
									NETWORK_OPTIONS.find(
										(o) => o.value === ExtendedBitcoinNetworkType.Testnet4,
									)?.label
								}
							</div>
							<div>• This only affects nBTC indexer configuration</div>
							<div>• Use TestnetV2 for faster transactions</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
