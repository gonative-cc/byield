import { Menu, BitcoinIcon, Wallet } from "lucide-react";
import { useContext, useMemo, useCallback } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

import {
	useCurrentAccount,
	useAccounts,
	useDisconnectWallet,
	useSwitchAccount,
	useSuiClientContext,
} from "@mysten/dapp-kit";
import { trimAddress } from "./Wallet/walletHelper";
import { SelectInput, type Option } from "./ui/select";
import { formatBTC, formatSUI } from "~/lib/denoms";
import { TrimmedNumber } from "./TrimmedNumber";
import { CopyButton } from "./ui/CopyButton";
import { BitcoinNetworkType, type Address } from "sats-connect";
import { useLocation } from "react-router";
import { isProductionMode } from "~/lib/appenv";

import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { useCoinBalance } from "./Wallet/SuiWallet/useBalance";

enum SuiNetwork {
	LocalNet = "localnet",
	TestNet = "testnet",
	MainNet = "mainnet",
}

const SuiNetworkLabel: Record<SuiNetwork, string> = {
	[SuiNetwork.LocalNet]: "Localnet",
	[SuiNetwork.TestNet]: "Testnet",
	[SuiNetwork.MainNet]: "Mainnet",
};

export function WalletBar() {
	const { toggleMobileMenu } = useContext(SideBarContext);
	const { isWalletConnected, xverse } = useContext(WalletContext);
	const currentSuiAccount = useCurrentAccount();

	const isBitcoinConnected = isWalletConnected(Wallets.Xverse);
	const isSuiConnected = isWalletConnected(Wallets.SuiWallet);

	// BTC components
	const xverseData = xverse!;
	const {
		network,
		switchNetwork,
		addressInfo,
		setCurrentAddress,
		balance,
		disconnectWallet,
		connectWallet,
		currentAddress,
	} = xverseData;
	const { pathname } = useLocation();
	const isUserOnMintNBTCPage = pathname === "/nbtc/mint";
	const bitcoinSupportedNetwork: Option[] = useMemo(
		() =>
			isUserOnMintNBTCPage
				? [{ label: "Devnet", value: BitcoinNetworkType.Regtest }]
				: [
						{ label: BitcoinNetworkType.Testnet4, value: BitcoinNetworkType.Testnet4 },
						{ label: BitcoinNetworkType.Mainnet, value: BitcoinNetworkType.Mainnet },
					],
		[isUserOnMintNBTCPage],
	);
	const btcNetworkOptions = (
		<SelectInput
			options={bitcoinSupportedNetwork}
			onValueChange={(value) => switchNetwork(value as BitcoinNetworkType)}
			placeholder="Select network"
			value={network}
			className="w-32"
		/>
	);
	const btcAccountsOptions = useMemo(
		() => addressInfo.map((a: Address) => ({ label: trimAddress(a.address), value: a.address })),
		[addressInfo],
	);
	const btcAccounts = (
		<SelectInput
			options={btcAccountsOptions}
			onValueChange={(address) => {
				const account = addressInfo.find((a) => a.address === address);
				if (account) setCurrentAddress(account);
			}}
			value={currentAddress?.address}
			className="w-40"
			optionItemRenderer={(val, handleOptionClick) => (
				<div>
					<button onClick={() => handleOptionClick(val)}>{val.label}</button>
					<CopyButton text={val.value} />
				</div>
			)}
		/>
	);
	const btcBalance = balance ? (
		<TrimmedNumber
			displayType="text"
			value={formatBTC(BigInt(balance))}
			suffix=" BTC"
			className="shrink-0"
		/>
	) : null;
	const btcAction = isBitcoinConnected ? (
		<button onClick={disconnectWallet} className="btn btn-primary btn-sm">
			Disconnect
		</button>
	) : (
		<button onClick={connectWallet} className="btn btn-primary btn-sm">
			Connect BTC
		</button>
	);

	// Sui components
	const { network: suiNetwork, selectNetwork } = useSuiClientContext();
	const handleSuiNetworkChange = useCallback(
		(value: SuiNetwork) => {
			selectNetwork(value);
		},
		[selectNetwork],
	);
	const isAuctionPathname = pathname === "/beelievers-auction" && isProductionMode();
	const isDevMode = !isProductionMode();
	const suiNetworks = useMemo(() => {
		if (isAuctionPathname) {
			return [{ label: SuiNetworkLabel[SuiNetwork.MainNet], value: SuiNetwork.MainNet }];
		}
		const baseNetworks = [{ label: SuiNetworkLabel[SuiNetwork.TestNet], value: SuiNetwork.TestNet }];
		if (isDevMode) {
			baseNetworks.unshift({ label: SuiNetworkLabel[SuiNetwork.LocalNet], value: SuiNetwork.LocalNet });
		}
		return baseNetworks;
	}, [isAuctionPathname, isDevMode]);
	const suiWalletNetworks: Option<SuiNetwork>[] = useMemo(() => suiNetworks, [suiNetworks]);
	const currentSuiNetwork =
		(suiNetwork as SuiNetwork) || (isDevMode ? SuiNetwork.LocalNet : SuiNetwork.TestNet);
	const suiNetworkOptions = (
		<SelectInput
			options={suiWalletNetworks}
			placeholder="Select network"
			onValueChange={handleSuiNetworkChange}
			value={currentSuiNetwork}
			className="w-32"
		/>
	);
	const { mutate: switchAccount } = useSwitchAccount();
	const accounts = useAccounts();
	const currentSelectedAccount = useCurrentAccount();
	const suiAccountsOptions: Option[] = useMemo(
		() => accounts.map((a) => ({ label: trimAddress(a.address), value: a.address })),
		[accounts],
	);
	const suiAccounts = (
		<SelectInput
			options={suiAccountsOptions}
			onValueChange={(address) => {
				const newAccount = accounts.find((a) => a.address === address);
				if (!newAccount) return;
				switchAccount(
					{ account: newAccount },
					{
						onSuccess: () => console.log(`Switched to ${newAccount.address}`),
					},
				);
			}}
			value={currentSelectedAccount?.address}
			className="w-40"
			optionItemRenderer={(val, handleOptionClick) => (
				<div>
					<button onClick={() => handleOptionClick(val)}>{val.label}</button>
					<CopyButton text={val.value} />
				</div>
			)}
		/>
	);
	const { balance: suiBalance } = useCoinBalance();
	const suiBalanceDisplay = (
		<TrimmedNumber displayType="text" value={formatSUI(suiBalance)} suffix=" SUI" className="shrink-0" />
	);
	const { mutate: disconnectSui } = useDisconnectWallet();
	const { handleWalletConnect } = useContext(WalletContext);
	const suiAction = isSuiConnected ? (
		<button
			onClick={() => {
				disconnectSui();
				handleWalletConnect(Wallets.SuiWallet, false);
			}}
			className="btn btn-primary btn-sm"
		>
			Disconnect
		</button>
	) : (
		<SuiModal />
	);

	return (
		<header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-14 w-full items-center justify-end border-b px-1 backdrop-blur-sm md:pr-10">
			<div className="flex w-full md:hidden">
				<button className="mr-2 focus:outline-hidden md:hidden" onClick={toggleMobileMenu}>
					<Menu className="h-6 w-6" />
				</button>
				<img src="/assets/app-logos/logo-mobile.svg" alt="Remix" className="md:hidden" />
			</div>
			<div className="flex items-center gap-4">
				{/* Compact wallet indicators */}
				<div className="flex items-center gap-2">
					<div className={`badge ${isBitcoinConnected ? "badge-success" : "badge-neutral"} gap-1`}>
						<BitcoinIcon className="h-4 w-4" />
						{isBitcoinConnected ? trimAddress(currentAddress?.address || "") : "BTC"}
					</div>
					<div className={`badge ${isSuiConnected ? "badge-success" : "badge-neutral"} gap-1`}>
						<Wallet className="h-4 w-4" />
						{isSuiConnected ? trimAddress(currentSuiAccount?.address || "") : "SUI"}
					</div>
				</div>
				{/* Wallet modal */}
				<Dialog>
					<DialogTrigger asChild>
						<button className="btn btn-ghost btn-sm hover:bg-primary/10 transition-colors">
							<Wallet className="h-4 w-4" />
							Wallets
						</button>
					</DialogTrigger>
					<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
						<div className="space-y-6">
							<h3 className="text-center text-lg font-semibold">Wallet Overview</h3>
							<div className="space-y-4">
								{/* Header */}
								<div className="grid grid-cols-5 items-center gap-4 text-sm font-medium">
									<div>Wallet</div>
									<div>Network</div>
									<div>Account</div>
									<div>Balance</div>
									<div>Action</div>
								</div>
								{/* BTC row */}
								<div className="grid grid-cols-5 items-center gap-4">
									<div className="text-sm font-medium">Bitcoin</div>
									<div>{btcNetworkOptions}</div>
									<div>{btcAccounts}</div>
									<div>{btcBalance}</div>
									<div>{btcAction}</div>
								</div>
								{/* Sui row */}
								<div className="grid grid-cols-5 items-center gap-4">
									<div className="text-sm font-medium">Sui</div>
									<div>{suiNetworkOptions}</div>
									<div>{suiAccounts}</div>
									<div>{suiBalanceDisplay}</div>
									<div>{suiAction}</div>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</header>
	);
}
