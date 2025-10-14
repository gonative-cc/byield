import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router";
import { BitcoinIcon, Wallet, Bitcoin } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { XverseWallet } from "./Wallet/XverseWallet/XverseWallet";
import { SuiWallet } from "./Wallet/SuiWallet/SuiWallet";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { routes } from "~/config/walletVisibility";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { useCurrentAccount, useAccounts, useSwitchAccount } from "@mysten/dapp-kit";

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

export function SelectWallet() {
	const { isWalletConnected } = useContext(WalletContext);
	const { connectWallet } = useXverseConnect();
	const { pathname } = useLocation();

	// Use hooks for getting wallet addresses and connection status
	const { currentAddress, network: bitcoinNetwork, setCurrentAddress, addressInfo } = useXverseWallet();
	const currentSuiAccount = useCurrentAccount();
	const allSuiAccounts = useAccounts();
	const { mutate: switchSuiAccount } = useSwitchAccount();

	// Check if we're still loading wallet connection status by checking if network is initially loading
	const isBitcoinConnected = isWalletConnected(Wallets.Xverse);
	const isSuiConnected = isWalletConnected(Wallets.SuiWallet);

	// Use the wallet connection status and account states to determine if we're still loading
	// If the wallet addresses are not yet determined but the connection status says they are connected,
	// that indicates loading state
	const bitcoinLoading = isBitcoinConnected && !currentAddress;
	const suiLoading = isSuiConnected && !currentSuiAccount;

	// If still loading for connected wallets, show loading indicators
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
		const newAddress = addressInfo.find((addr) => addr.address === e.target.value);
		if (newAddress) {
			setCurrentAddress(newAddress);
		}
	};

	const bitcoinWalletStatus = (
		<div
			className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
				isBitcoinConnected
					? "border border-amber-200 bg-amber-100 text-amber-800"
					: "bg-base-200 text-base-content/60"
			}`}
		>
			<Bitcoin size={16} className={isBitcoinConnected ? "text-amber-500" : "text-base-content/60"} />
			{addressInfo.length > 1 ? (
				<select
					value={currentAddress?.address || ""}
					onChange={handleBitcoinAddressChange}
					className="border-none bg-transparent text-xs font-medium focus:outline-none md:text-sm"
				>
					{addressInfo.map((address) => (
						<option key={address.address} value={address.address}>
							{trimAddress(address.address)}
						</option>
					))}
				</select>
			) : (
				<span className="text-xs md:text-sm">
					{isBitcoinConnected ? trimAddress(currentAddress?.address || "") : "BTC"}
				</span>
			)}
		</div>
	);

	// Handle Sui account switching via select
	const handleSuiAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (allSuiAccounts) {
			const newAccount = allSuiAccounts.find((acc) => acc.address === e.target.value);
			if (newAccount) {
				switchSuiAccount({ account: newAccount });
			}
		}
	};

	const suiWalletStatus = (
		<div
			className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
				isSuiConnected
					? "border border-blue-200 bg-blue-100 text-blue-800"
					: "bg-base-200 text-base-content/60"
			}`}
		>
			<Wallet size={16} className={isSuiConnected ? "text-blue-500" : "text-base-content/60"} />
			{allSuiAccounts && allSuiAccounts.length > 1 ? (
				<select
					value={currentSuiAccount?.address || ""}
					onChange={handleSuiAccountChange}
					className="border-none bg-transparent text-xs font-medium focus:outline-none md:text-sm"
				>
					{allSuiAccounts.map((account) => (
						<option key={account.address} value={account.address}>
							{trimAddress(account.address)}
						</option>
					))}
				</select>
			) : (
				<span className="text-xs md:text-sm">
					{isSuiConnected ? trimAddress(currentSuiAccount?.address || "") : "SUI"}
				</span>
			)}
		</div>
	);

	// If both wallets are connected, just show the status badges
	if (isBitcoinConnected && isSuiConnected) {
		return (
			<div className="flex items-center gap-2">
				{bitcoinWalletStatus}
				{suiWalletStatus}
			</div>
		);
	}

	// If only SUI is connected and we need to allow connecting Bitcoin
	if (isSuiConnected && !isBitcoinConnected) {
		return (
			<div className="flex items-center gap-2">
				<button onClick={connectWallet} className="btn btn-primary btn-sm">
					<BitcoinIcon className="h-4 w-4" />
					Connect Bitcoin
				</button>
				{suiWalletStatus}
			</div>
		);
	}

	// If only Bitcoin is connected and we need to allow connecting SUI
	if (isBitcoinConnected && !isSuiConnected) {
		return (
			<div className="flex items-center gap-2">
				{bitcoinWalletStatus}
				<SuiModal />
			</div>
		);
	}

	// If neither wallet is connected, show both connection options
	return (
		<div className="flex items-center gap-2">
			<button onClick={connectWallet} className="btn btn-primary btn-sm">
				<BitcoinIcon className="h-4 w-4" />
				Connect BTC
			</button>
			<SuiModal />
		</div>
	);
}
