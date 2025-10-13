import { useContext } from "react";
import { useLocation } from "react-router";
import { BitcoinIcon, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { XverseWallet } from "./Wallet/XverseWallet/XverseWallet";
import { SuiWallet } from "./Wallet/SuiWallet/SuiWallet";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { routes } from "~/config/walletVisibility";

interface SelectWalletProps {
	isProductionMode: boolean;
}

function WalletSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-2">
			<h4 className="text-sm font-medium">{title}</h4>
			{children}
		</div>
	);
}

function MobileWalletModal({ children }: { children: React.ReactNode }) {
	return (
		<div className="md:hidden">
			<Dialog>
				<DialogTrigger asChild>
					<button className="btn btn-primary btn-outline btn-sm">
						<Wallet size={16} /> Wallet
					</button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<div className="space-y-4">{children}</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function DesktopWallets({ children }: { children: React.ReactNode }) {
	return <div className="hidden md:flex md:items-center md:gap-4">{children}</div>;
}

export function SelectWallet({ isProductionMode }: SelectWalletProps) {
	const { isWalletConnected } = useContext(WalletContext);
	const { connectWallet } = useXverseConnect();
	const { pathname } = useLocation();

	const shouldShowBitcoinWallet = routes[pathname]?.bitcoin ?? true;
	const shouldShowSUIWallet = routes[pathname]?.sui ?? true;
	const isBitcoinConnected = isWalletConnected(Wallets.Xverse);
	const isSuiConnected = isWalletConnected(Wallets.SuiWallet);

	const bitcoinWallet =
		shouldShowBitcoinWallet &&
		!isProductionMode &&
		(isBitcoinConnected ? (
			<XverseWallet />
		) : (
			<button onClick={connectWallet} className="btn btn-primary w-full md:w-auto">
				<BitcoinIcon className="h-5 w-5" />
				Connect Bitcoin Wallet
			</button>
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
