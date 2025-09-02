import { useContext } from "react";
import { useLocation } from "react-router";
import { EllipsisVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { XverseWallet } from "./Wallet/XverseWallet/XverseWallet";
import { SuiWallet } from "./Wallet/SuiWallet/SuiWallet";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { routes } from "~/config/walletVisibility";

function LoadingSkeleton() {
	return (
		<div className="flex gap-2 w-full">
			<Skeleton className="h-10 flex-1" />
			<Skeleton className="h-10 flex-1" />
		</div>
	);
}

interface SelectWalletProps {
	isProductionMode: boolean;
}

function WalletSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-2">
			<h4 className="font-medium text-sm">{title}</h4>
			{children}
		</div>
	);
}

function MobileWalletModal({ children }: { children: React.ReactNode }) {
	return (
		<div className="md:hidden">
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm" className="gap-2">
						<span className="text-xs">Wallets</span>
						<EllipsisVertical size={16} />
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<div className="space-y-4">{children}</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function DesktopWallets({ children }: { children: React.ReactNode }) {
	return <div className="hidden md:flex md:gap-4 md:items-center">{children}</div>;
}

export function SelectWallet({ isProductionMode }: SelectWalletProps) {
	const { isLoading, isWalletConnected } = useContext(WalletContext);
	const { connectWallet } = useXverseConnect();
	const { pathname } = useLocation();

	const shouldShowBitcoinWallet = routes[pathname]?.bitcoin ?? true;
	const shouldShowSUIWallet = routes[pathname]?.sui ?? true;
	const isBitcoinConnected = isWalletConnected(Wallets.Xverse);
	const isSuiConnected = isWalletConnected(Wallets.SuiWallet);

	if (isLoading) return <LoadingSkeleton />;

	const bitcoinWallet =
		shouldShowBitcoinWallet &&
		!isProductionMode &&
		(isBitcoinConnected ? (
			<XverseWallet />
		) : (
			<Button type="button" onClick={connectWallet} className="md:w-auto w-full">
				Connect Bitcoin Wallet
			</Button>
		));

	const suiWallet = shouldShowSUIWallet && (isSuiConnected ? <SuiWallet /> : <SuiModal />);

	return (
		<>
			<DesktopWallets>
				{bitcoinWallet}
				{suiWallet}
			</DesktopWallets>

			<MobileWalletModal>
				{shouldShowBitcoinWallet && !isProductionMode && (
					<WalletSection title="Bitcoin Wallet">{bitcoinWallet}</WalletSection>
				)}
				{shouldShowSUIWallet && <WalletSection title="Sui Wallet">{suiWallet}</WalletSection>}
			</MobileWalletModal>
		</>
	);
}
