import { SelectWallet } from "./SelectWallet";
import { Menu, Bitcoin, Wallet, X } from "lucide-react";
import { useContext } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "~/components/ui/dialog";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { useSuiClientContext, useCurrentAccount, useAccounts, useDisconnectWallet } from "@mysten/dapp-kit";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatBTC } from "~/lib/denoms";
import { formatSUI } from "~/lib/denoms";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { TrimmedNumber } from "~/components/TrimmedNumber";

interface WalletOverviewModalProps {
	open: boolean;
	onClose: () => void;
}

function WalletOverviewModal({ children }: { children: React.ReactNode }) {
	const { addressInfo, currentAddress, balance, network, disconnectWallet } = useXverseWallet();
	const { mutate: suiDisconnect } = useDisconnectWallet();
	const { network: suiNetwork } = useSuiClientContext();
	const currentSuiAccount = useCurrentAccount();
	const allSuiAccounts = useAccounts();
	const { balance: suiBalance } = useCoinBalance();

	const handleSuiDisconnect = () => {
		suiDisconnect();
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className="bg-base-100 border-base-300 max-w-md rounded-lg border p-6 shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-base-content text-lg font-bold">Wallet Overview</h3>
					<DialogClose asChild>
						<button className="btn btn-ghost btn-sm" aria-label="Close">
							<X size={20} />
						</button>
					</DialogClose>
				</div>

				{/* Bitcoin Wallet Section */}
				{addressInfo.length > 0 && (
					<div className="mb-6">
						<div className="mb-3 flex items-center gap-2">
							<Bitcoin className="text-amber-500" size={20} />
							<h4 className="text-base font-semibold">Bitcoin Wallet</h4>
						</div>

						<div className="bg-base-200 space-y-3 rounded-lg p-4">
							<div className="flex justify-between">
								<span className="text-base-content/70 text-sm">Network:</span>
								<span className="text-sm font-medium">{network}</span>
							</div>

							<div className="flex justify-between">
								<span className="text-base-content/70 text-sm">Address:</span>
								<span className="max-w-[120px] truncate text-right font-mono text-sm">
									{trimAddress(currentAddress?.address || "")}
								</span>
							</div>

							{balance && (
								<div className="flex justify-between">
									<span className="text-base-content/70 text-sm">Balance:</span>
									<span className="text-sm font-medium">
										<TrimmedNumber
											displayType="text"
											value={formatBTC(BigInt(balance))}
											suffix=" BTC"
										/>
									</span>
								</div>
							)}

							<button onClick={disconnectWallet} className="btn btn-error btn-sm mt-2 w-full">
								Disconnect BTC Wallet
							</button>
						</div>
					</div>
				)}

				{/* Sui Wallet Section */}
				{currentSuiAccount && (
					<div>
						<div className="mb-3 flex items-center gap-2">
							<Wallet className="text-blue-500" size={20} />
							<h4 className="text-base font-semibold">Sui Wallet</h4>
						</div>

						<div className="bg-base-200 space-y-3 rounded-lg p-4">
							<div className="flex justify-between">
								<span className="text-base-content/70 text-sm">Network:</span>
								<span className="text-sm font-medium capitalize">{suiNetwork}</span>
							</div>

							<div className="flex justify-between">
								<span className="text-base-content/70 text-sm">Address:</span>
								<span className="max-w-[120px] truncate text-right font-mono text-sm">
									{trimAddress(currentSuiAccount.address)}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="text-base-content/70 text-sm">Balance:</span>
								<span className="text-sm font-medium">
									<TrimmedNumber
										displayType="text"
										value={formatSUI(suiBalance)}
										suffix=" SUI"
									/>
								</span>
							</div>

							<button
								onClick={handleSuiDisconnect}
								className="btn btn-error btn-sm mt-2 w-full"
							>
								Disconnect Sui Wallet
							</button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export function WalletBar() {
	const { toggleMobileMenu } = useContext(SideBarContext);
	const { isWalletConnected } = useContext(WalletContext);

	const isBitcoinConnected = isWalletConnected(Wallets.Xverse);
	const isSuiConnected = isWalletConnected(Wallets.SuiWallet);

	// Use hooks properly
	const { currentAddress } = useXverseWallet();
	const currentSuiAccount = useCurrentAccount();

	return (
		<header className="bg-base-100/90 supports-backdrop-filter:bg-base-100/70 sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-sm">
			{/* Left side: Mobile menu and logo */}
			<div className="flex items-center">
				<button
					className="btn btn-ghost btn-sm mr-2 md:hidden"
					onClick={toggleMobileMenu}
					aria-label="Toggle menu"
				>
					<Menu className="h-5 w-5" />
				</button>
				<img
					src="/assets/app-logos/logo-mobile.svg"
					alt="Native BYield"
					className="hidden h-8 w-auto md:block"
				/>
				<img
					src="/assets/app-logos/logo-mobile.svg"
					alt="Native BYield"
					className="h-6 w-auto md:hidden"
				/>
			</div>

			{/* Right side: Wallets and overview button */}
			<div className="flex items-center gap-2">
				{/* Bitcoin Wallet Status */}
				<div
					className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
						isBitcoinConnected
							? "border border-amber-200 bg-amber-100 text-amber-800"
							: "bg-base-200 text-base-content/60"
					}`}
				>
					<Bitcoin
						size={16}
						className={isBitcoinConnected ? "text-amber-500" : "text-base-content/60"}
					/>
					<span className="hidden text-xs sm:inline md:text-sm">
						{isBitcoinConnected ? trimAddress(currentAddress?.address || "") : "BTC"}
					</span>
				</div>

				{/* Sui Wallet Status */}
				<div
					className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
						isSuiConnected
							? "border border-blue-200 bg-blue-100 text-blue-800"
							: "bg-base-200 text-base-content/60"
					}`}
				>
					<Wallet size={16} className={isSuiConnected ? "text-blue-500" : "text-base-content/60"} />
					<span className="hidden text-xs sm:inline md:text-sm">
						{isSuiConnected ? trimAddress(currentSuiAccount?.address || "") : "SUI"}
					</span>
				</div>

				{/* Wallet Overview Button */}
				<WalletOverviewModal>
					<button className="btn btn-ghost btn-sm ml-1" aria-label="Wallet Overview">
						<Wallet size={18} />
						<span className="ml-1 hidden md:inline">Overview</span>
					</button>
				</WalletOverviewModal>

				{/* Wallet Connection Button - Only show when no wallets are connected */}
				{!isBitcoinConnected && !isSuiConnected && (
					<div className="hidden md:flex">
						<SelectWallet />
					</div>
				)}
			</div>
		</header>
	);
}
