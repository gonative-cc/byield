import { useContext } from "react";
import { useLocation } from "react-router";
import { BitcoinIcon, Wallet, Bitcoin } from "lucide-react";
import { SuiConnectModal } from "./Wallet/SuiWallet/SuiModal";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { routes } from "~/config/walletVisibility";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { SUIIcon } from "~/components/icons";
import { useCurrentAccount, useAccounts, useSwitchAccount } from "@mysten/dapp-kit";

export function SelectWallet() {
	const { isWalletConnected } = useContext(WalletContext);
	const { connectWallet } = useXverseConnect();
	const { pathname } = useLocation();

	const { currentAddress, setCurrentAddress, addressInfo: bitcoinAddresses } = useXverseWallet();
	const currentSuiAccount = useCurrentAccount();
	const allSuiAccounts = useAccounts();
	const { mutate: switchSuiAccount } = useSwitchAccount();

	const shouldShowBitcoinWallet = routes[pathname]?.bitcoin ?? true;
	const shouldShowSUIWallet = routes[pathname]?.sui ?? true;

	const isBitcoinConnected = isWalletConnected(Wallets.Xverse);
	const isSuiConnected = isWalletConnected(Wallets.SuiWallet);

	const bitcoinLoading = isBitcoinConnected && !currentAddress;
	const suiLoading = isSuiConnected && !currentSuiAccount;

	// If still loading for connected wallets, show loading indicators
	// TODO: this have to be finished
	if (bitcoinLoading || suiLoading) {
		return (
			<div className="flex items-center gap-2">
				{bitcoinLoading && (
					<div className="bg-base-200 text-base-content/60 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm">
						<Bitcoin size={16} className="text-base-content/60" />
						<span className="text-xs md:text-sm">Loading...</span>
					</div>
				)}
				{suiLoading && (
					<div className="bg-base-200 text-base-content/60 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm">
						<Wallet size={16} className="text-base-content/60" />
						<span className="text-xs md:text-sm">Loading...</span>
					</div>
				)}
			</div>
		);
	}

	// Handle Bitcoin address switching via select
	const handleBitcoinAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newAddress = bitcoinAddresses.find((addr) => addr.address === e.target.value);
		if (newAddress) {
			setCurrentAddress(newAddress);
		}
	};

	const handleSuiAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (allSuiAccounts) {
			const newAccount = allSuiAccounts.find((acc) => acc.address === e.target.value);
			if (newAccount) {
				switchSuiAccount({ account: newAccount });
			}
		}
	};

	const bitcoinWalletStatus =
		shouldShowBitcoinWallet &&
		(isBitcoinConnected ? (
			walletBadge(
				<Bitcoin size={20} className="text-amber-500" />,
				bitcoinAddresses,
				currentAddress?.address || "",
				handleBitcoinAddressChange,
			)
		) : (
			<button onClick={connectWallet} className="btn btn-primary btn-sm">
				<BitcoinIcon className="h-4 w-4" />
				Connect Bitcoin
			</button>
		));

	const suiWalletStatus =
		shouldShowSUIWallet &&
		(isSuiConnected && currentSuiAccount ? (
			walletBadge(
				<SUIIcon prefix="" className="h-5 w-5" />,
				allSuiAccounts,
				currentSuiAccount.address,
				handleSuiAccountChange,
			)
		) : (
			<SuiConnectModal />
		));

	return (
		<div className="flex items-center gap-2">
			{bitcoinWalletStatus}
			{suiWalletStatus}
		</div>
	);
}

const walletBadgeStyle =
	"flex items-center gap-1.5 rounded-full border border-blue-800 bg-blue-800 px-3 py-1.5 text-sm text-blue-200";
const selectAccountClass = "border-none bg-blue-800 text-xs font-medium focus:outline-none md:text-sm";

const walletBadge = (
	badge: React.ReactNode,
	accounts: readonly { address: string }[],
	currentAccount: string,
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
) => (
	<div className={walletBadgeStyle}>
		{badge}
		{accounts && accounts.length > 1 ? (
			<select value={currentAccount} onChange={onChange} className={selectAccountClass}>
				{accounts.map((account) => (
					<option key={account.address} value={account.address}>
						{trimAddress(account.address)}
					</option>
				))}
			</select>
		) : (
			<span className="text-xs md:text-sm">{trimAddress(currentAccount)}</span>
		)}
	</div>
);
