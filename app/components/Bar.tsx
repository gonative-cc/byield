import { SelectWallet } from "./SelectWallet";
import { Menu, Bitcoin, Wallet, X } from "lucide-react";
import { useContext } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "~/components/ui/dialog";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import {
	useSuiClientContext,
	useCurrentAccount,
	useAccounts,
	useDisconnectWallet,
	useSwitchAccount,
} from "@mysten/dapp-kit";
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
	const { addressInfo, currentAddress, balance, network, disconnectWallet, setCurrentAddress } =
		useXverseWallet();
	const { mutate: suiDisconnect } = useDisconnectWallet();
	const { network: suiNetwork } = useSuiClientContext();
	const currentSuiAccount = useCurrentAccount();
	const allSuiAccounts = useAccounts();
	const { balance: suiBalance } = useCoinBalance();
	const { mutate: switchSuiAccount } = useSwitchAccount();

	const handleSuiDisconnect = () => {
		suiDisconnect();
	};

	// Handle SUI account switching
	const handleSuiAccountChange = (address: string) => {
		const newAccount = allSuiAccounts?.find((acc) => acc.address === address);
		if (newAccount) {
			switchSuiAccount({ account: newAccount });
		}
	};

	// Handle Bitcoin address switching
	const handleBitcoinAddressChange = (address: string) => {
		const newAddress = addressInfo.find((addr) => addr.address === address);
		if (newAddress) {
			setCurrentAddress(newAddress);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="top-0 translate-y-0 md:top-[20%]" onClick={(e) => e.stopPropagation()}>
				<h3 className="text-base-content text-lg font-bold">Wallet Overview</h3>

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

							{addressInfo.length > 1 && (
								<div className="flex items-center justify-between">
									<span className="text-base-content/70 text-sm">Address:</span>
									<select
										value={currentAddress?.address || ""}
										onChange={(e) => handleBitcoinAddressChange(e.target.value)}
										className="select select-sm select-bordered max-w-[100px] flex-shrink"
									>
										{addressInfo.map((address) => (
											<option key={address.address} value={address.address}>
												{trimAddress(address.address)}
											</option>
										))}
									</select>
								</div>
							)}

							{addressInfo.length <= 1 && (
								<div className="flex justify-between">
									<span className="text-base-content/70 text-sm">Address:</span>
									<span className="max-w-[120px] truncate text-right font-mono text-sm">
										{trimAddress(currentAddress?.address || "")}
									</span>
								</div>
							)}

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

							{allSuiAccounts && allSuiAccounts.length > 1 && (
								<div className="flex items-center justify-between">
									<span className="text-base-content/70 text-sm">Account:</span>
									<select
										value={currentSuiAccount.address}
										onChange={(e) => handleSuiAccountChange(e.target.value)}
										className="select select-sm select-bordered max-w-[100px] flex-shrink"
									>
										{allSuiAccounts.map((account) => (
											<option key={account.address} value={account.address}>
												{trimAddress(account.address)}
											</option>
										))}
									</select>
								</div>
							)}

							{(!allSuiAccounts || allSuiAccounts.length <= 1) && (
								<div className="flex justify-between">
									<span className="text-base-content/70 text-sm">Address:</span>
									<span className="max-w-[120px] truncate text-right font-mono text-sm">
										{trimAddress(currentSuiAccount.address)}
									</span>
								</div>
							)}

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
			<div className="flex items-center gap-3">
				<SelectWallet />

				{/* Wallet Overview Button */}
				<WalletOverviewModal>
					<button className="btn btn-ghost btn-sm" aria-label="Wallet Overview">
						<Wallet size={18} />
						<span className="ml-1 hidden md:inline">Overview</span>
					</button>
				</WalletOverviewModal>
			</div>
		</header>
	);
}
