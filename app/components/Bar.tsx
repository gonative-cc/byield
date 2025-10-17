import { SelectWallet } from "./SelectWallet";
import { Menu, Bitcoin, Wallet } from "lucide-react";
import { useCallback, useContext, useMemo } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import {
	useSuiClientContext,
	useCurrentAccount,
	useAccounts,
	useDisconnectWallet,
	useSwitchAccount,
} from "@mysten/dapp-kit";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatBTC, formatNBTC } from "~/lib/denoms";
import { formatSUI } from "~/lib/denoms";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { TrimmedNumber } from "~/components/TrimmedNumber";
import { useLocation } from "react-router";
import { type Option, SelectInput } from "./ui/select";
import { BitcoinNetworkType } from "sats-connect";
import { CopyButton } from "./ui/CopyButton";
import { isProductionMode } from "~/lib/appenv";
import { routes } from "~/config/walletVisibility";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "./Wallet";

function NetworkOptions() {
	const { network, switchNetwork } = useXverseWallet();

	const location = useLocation();
	const pathname = location.pathname;
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

	if (bitcoinSupportedNetwork.length === 1)
		return <span className="text-sm">{bitcoinSupportedNetwork[0].label}</span>;

	return (
		<SelectInput
			options={bitcoinSupportedNetwork}
			onValueChange={(value) => switchNetwork(value as BitcoinNetworkType)}
			placeholder="Select network"
			value={network}
			className="w-full md:w-auto"
		/>
	);
}

function Accounts() {
	const { addressInfo, currentAddress, setCurrentAddress } = useXverseWallet();
	const options = useMemo(
		() => addressInfo.map((a) => ({ label: trimAddress(a.address), value: a.address })),
		[addressInfo],
	);

	if (options.length === 1)
		return <span className="font-mono text-sm">{trimAddress(currentAddress?.address || "")}</span>;

	return (
		<SelectInput
			options={options}
			onValueChange={(address) => {
				const account = addressInfo.find((a) => a.address === address);
				if (account) setCurrentAddress(account);
			}}
			value={currentAddress?.address}
			optionItemRenderer={(val, handleOptionClick) => (
				<div>
					<button onClick={() => handleOptionClick(val)}>{val.label}</button>
					<CopyButton text={val.value} />
				</div>
			)}
		/>
	);
}

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

function SuiNetworkOptions() {
	const location = useLocation();
	const pathname = location.pathname;

	const { network, selectNetwork } = useSuiClientContext();
	const handleChange = useCallback(
		(value: SuiNetwork) => {
			selectNetwork(value);
		},
		[selectNetwork],
	);

	const isAuctionPathname = pathname === "/beelievers-auction" && isProductionMode();
	const isDevMode = !isProductionMode();

	const networks = useMemo(() => {
		if (isAuctionPathname) {
			return [{ label: SuiNetworkLabel[SuiNetwork.MainNet], value: SuiNetwork.MainNet }];
		}

		const baseNetworks = [{ label: SuiNetworkLabel[SuiNetwork.TestNet], value: SuiNetwork.TestNet }];

		// Add localnet option in dev mode
		if (isDevMode) {
			baseNetworks.unshift({ label: SuiNetworkLabel[SuiNetwork.LocalNet], value: SuiNetwork.LocalNet });
		}

		return baseNetworks;
	}, [isAuctionPathname, isDevMode]);

	const suiWalletNetworks: Option<SuiNetwork>[] = useMemo(() => networks, [networks]);

	const currentNetwork = (network as SuiNetwork) || (isDevMode ? SuiNetwork.LocalNet : SuiNetwork.TestNet);

	return (
		<SelectInput
			options={suiWalletNetworks}
			placeholder="Select network"
			onValueChange={handleChange}
			value={currentNetwork}
		/>
	);
}

function SuiAccounts() {
	const { mutate: switchAccount } = useSwitchAccount();
	const accounts = useAccounts();
	const currentSelectedAccount = useCurrentAccount();

	const options: Option[] = useMemo(
		() => accounts.map((a) => ({ label: trimAddress(a.address), value: a.address })),
		[accounts],
	);

	if (accounts.length === 1)
		return <span className="font-mono text-sm">{trimAddress(accounts[0].address)}</span>;

	return (
		<SelectInput
			options={options}
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
			optionItemRenderer={(val, handleOptionClick) => (
				<div>
					<button onClick={() => handleOptionClick(val)}>{val.label}</button>
					<CopyButton text={val.value} />
				</div>
			)}
		/>
	);
}

function WalletOverviewModal() {
	const { addressInfo, balance, disconnectWallet } = useXverseWallet();
	const { mutate: suiDisconnect } = useDisconnectWallet();
	const currentSuiAccount = useCurrentAccount();
	const { balance: suiBalance } = useCoinBalance();
	const nbtcBalanceRes = useCoinBalance("NBTC");

	const { pathname } = useLocation();
	const shouldShowBitcoinWallet = routes[pathname]?.bitcoin ?? true;
	const shouldShowSUIWallet = routes[pathname]?.sui ?? true;

	const handleSuiDisconnect = () => {
		suiDisconnect();
	};

	return (
		<Dialog>
			<DialogTrigger>
				<button className="btn btn-primary btn-outline btn-sm" aria-label="Wallet Overview">
					<Wallet size={18} />
					<span className="ml-1 hidden md:inline">Overview</span>
				</button>
			</DialogTrigger>
			<DialogContent
				className="bg-base-100 border-base-300 max-w-sm rounded-lg border p-6 shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="text-base-content text-lg font-bold">Wallet Overview</h3>

				{/* Bitcoin Wallet Section */}
				{addressInfo.length > 0 && shouldShowBitcoinWallet && (
					<div className="mb-2">
						<div className="mb-3 flex items-center gap-2">
							<Bitcoin className="text-amber-500" size={20} />
							<h4 className="text-base font-semibold">Bitcoin Wallet</h4>
						</div>

						<div className="bg-base-200 space-y-2 rounded-lg p-2">
							<div className="flex items-center justify-between">
								<span className="text-base-content/70 text-sm">Network:</span>
								<NetworkOptions />
							</div>

							<div className="flex items-center justify-between">
								<span className="text-base-content/70 text-sm">Address:</span>
								<Accounts />
							</div>

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

							<button
								onClick={disconnectWallet}
								className="btn btn-accent btn-sm text-foreground mt-2 w-auto"
							>
								Disconnect BTC Wallet
							</button>
						</div>
					</div>
				)}

				{/* Sui Wallet Section */}
				{currentSuiAccount && shouldShowSUIWallet && (
					<div>
						<div className="mb-3 flex items-center gap-2">
							<Wallet className="text-blue-500" size={20} />
							<h4 className="text-base font-semibold">Sui Wallet</h4>
						</div>

						<div className="bg-base-200 space-y-3 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<span className="text-base-content/70 text-sm">Network:</span>
								<SuiNetworkOptions />
							</div>

							<div className="flex place-items-center justify-between">
								<span className="text-base-content/70 text-sm">Address:</span>
								<SuiAccounts />
							</div>

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

							{nbtcBalanceRes && (
								<div className="flex justify-between">
									<span className="text-base-content/70 text-sm">nBTC Balance:</span>
									<span className="text-sm font-medium">
										<TrimmedNumber
											displayType="text"
											value={formatNBTC(nbtcBalanceRes.balance)}
											suffix=" nBTC"
										/>
									</span>
								</div>
							)}

							<button
								onClick={handleSuiDisconnect}
								className="btn btn-accent btn-sm text-foreground mt-2 w-auto"
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
	const { isWalletConnected } = useContext(WalletContext);
	const isBitcoinConnected = isWalletConnected(Wallets.Xverse);
	const isSuiConnected = isWalletConnected(Wallets.SuiWallet);

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
			<div className="flex items-center gap-3">
				<SelectWallet />
				{shouldShowOverView && <WalletOverviewModal />}
			</div>
		</header>
	);
}
