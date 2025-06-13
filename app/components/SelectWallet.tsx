import { Button } from "~/components/ui/button";
import { useContext } from "react";
import { XverseWallet } from "./Wallet/XverseWallet/XverseWallet";
import { SuiWallet } from "./Wallet/SuiWallet/SuiWallet";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { Skeleton } from "./ui/skeleton";

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
	const { connectedWallet, isLoading } = useContext(WalletContext);
	const { connectWallet } = useXverseConnect();

	if (isLoading) return <LoadingSkeleton />;

	// none of the wallet is connected, than show connect button for all available wallets
	if (!connectedWallet) {
		return (
			<>
				{/* Xverse wallet connect button */}
				{!isProductionMode && (
					<Button type="button" onClick={connectWallet}>
						Connect Bitcoin Wallet
					</Button>
				)}
				{/* Sui Wallet Connect Modal */}
				<SuiModal />
			</>
		);
	}

	// one of the wallet is connected
	return (
		<>
			{connectedWallet === ByieldWallet.Xverse && <XverseWallet />}
			{connectedWallet === ByieldWallet.SuiWallet && <SuiWallet />}
		</>
	);
}
