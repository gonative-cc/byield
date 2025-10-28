import { SelectWallet, WalletOverviewModal } from "./SelectWallet";
import { Menu } from "lucide-react";
import { useContext } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { BeelieversBadge } from "./BeelieversBadge";
import { useXverseAddress } from "./Wallet/XverseWallet/useXverseAddress";

export function WalletBar() {
	const { toggleMobileMenu } = useContext(SideBarContext);
	const { bitcoinAddress } = useXverseAddress();
	const isBitcoinConnected = !!bitcoinAddress;
	const suiAccount = useCurrentAccount();
	const isSuiConnected = !!suiAccount;
	const shouldShowOverView = isBitcoinConnected || isSuiConnected;

	return (
		<header className="bg-base-100/90 supports-backdrop-filter:bg-base-100/70 sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b pr-2 backdrop-blur-sm">
			{/* Left side: Mobile menu and logo */}
			<div className="flex items-center">
				<button
					className="btn btn-ghost btn-xs md:hidden"
					onClick={toggleMobileMenu}
					aria-label="Toggle menu"
				>
					<Menu className="h-5 w-5" />
				</button>
				<img
					src="/assets/app-logos/logo-mobile.svg"
					alt="Native BYield"
					className="h-6 w-auto md:hidden"
				/>
			</div>

			{/* Right side: Wallets and overview button */}
			<div className="flex items-center gap-2">
				{shouldShowOverView && <BeelieversBadge />}
				<SelectWallet />
				{shouldShowOverView && <WalletOverviewModal />}
			</div>
		</header>
	);
}
