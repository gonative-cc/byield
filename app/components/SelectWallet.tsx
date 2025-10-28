import { useLocation } from "react-router";
import { BitcoinIcon, Bitcoin } from "lucide-react";
import { SuiConnectModal } from "./Wallet/SuiWallet/SuiModal";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { routes } from "~/config/walletVisibility";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { SUIIcon } from "~/components/icons";
import { useCurrentAccount, useAccounts, useSwitchAccount } from "@mysten/dapp-kit";
import { CopyButton } from "./ui/CopyButton";

export function SelectWallet() {
	const { connectWallet } = useXverseConnect();
	const { pathname } = useLocation();

	const { currentAddress, setCurrentAddress, addressInfo: bitcoinAddresses } = useXverseWallet();
	const isBitcoinConnected = !!currentAddress;
	const currentSuiAccount = useCurrentAccount();
	const allSuiAccounts = useAccounts();
	const { mutate: switchSuiAccount } = useSwitchAccount();

	const shouldShowBitcoinWallet = routes[pathname]?.bitcoin ?? true;
	const shouldShowSUIWallet = routes[pathname]?.sui ?? true;
	const isSuiConnected = !!currentSuiAccount;

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
				<Bitcoin size={20} />,
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

const walletBadgeStyle = "gap-1 px-2 btn btn-sm btn-primary btn-outline";

const walletBadge = (
	badge: React.ReactNode,
	accounts: readonly { address: string }[],
	currentAccount: string,
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
) => (
	<div className={walletBadgeStyle}>
		{badge}
		{accounts && accounts.length > 1 ? (
			<select value={currentAccount} onChange={onChange}>
				{accounts.map((account) => (
					<option key={account.address} value={account.address}>
						{trimAddress(account.address)}
					</option>
				))}
			</select>
		) : (
			<span className="content-center text-xs md:text-sm">
				{trimAddress(currentAccount)} <CopyButton text={currentAccount} />
			</span>
		)}
	</div>
);
