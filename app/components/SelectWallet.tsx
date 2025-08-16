import { Button } from "~/components/ui/button";
import { useContext } from "react";
import { XverseWallet } from "./Wallet/XverseWallet/XverseWallet";
import { SuiWallet } from "./Wallet/SuiWallet/SuiWallet";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { Skeleton } from "~/components/ui/skeleton";
import { useLocation } from "react-router";
import { routes } from "~/config/walletVisibility";

function LoadingSkeleton() {
	return (
		<div className="flex gap-2 w-full">
			<Skeleton className="h-10 flex-1 flex" />
			<Skeleton className="h-10 flex-1 flex" />
			<Skeleton className="h-10 flex-1 flex" />
		</div>
	);
}

interface SelectWalletProps {
	isProductionMode: boolean;
}

export function SelectWallet({ isProductionMode }: SelectWalletProps) {
	const { isLoading, isWalletConnected } = useContext(WalletContext);
	const { connectWallet } = useXverseConnect();
	const location = useLocation();
	const currentPath = location.pathname;

	const shouldShowBitcoinWallet = routes[currentPath]?.bitcoin ?? true;
	const shouldShowSUIWallet = routes[currentPath]?.sui ?? true;

	if (isLoading) return <LoadingSkeleton />;

	return (
		<>
			{/* Show connect buttons for wallets that aren't connected */}
			{shouldShowBitcoinWallet && !isWalletConnected(Wallets.Xverse) && !isProductionMode && (
				<Button type="button" onClick={connectWallet}>
					Connect Bitcoin Wallet
				</Button>
			)}
			{shouldShowSUIWallet && !isWalletConnected(Wallets.SuiWallet) && <SuiModal />}

			{/* Show connected wallets */}
			{shouldShowBitcoinWallet && isWalletConnected(Wallets.Xverse) && <XverseWallet />}
			{shouldShowSUIWallet && isWalletConnected(Wallets.SuiWallet) && <SuiWallet />}
		</>
	);
}
