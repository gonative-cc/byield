import { useLocation } from "react-router";
import { BitcoinIcon, Bitcoin, Wallet } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useCurrentAccount, useAccounts, useDisconnectWallet, useSwitchAccount } from "@mysten/dapp-kit";
import { useSuiNetwork } from "~/hooks/useSuiNetwork";
import { BitcoinNetworkType } from "sats-connect";
import { routes } from "~/config/walletVisibility";
import { isProductionMode } from "~/lib/appenv";
import { formatSUI, formatBTC, formatNBTC } from "~/lib/denoms";
import { type Option, SelectInput } from "./ui/select";
import { SuiConnectModal } from "./Wallet/SuiWallet/SuiModal";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { SUIIcon } from "~/components/icons";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { TrimmedNumber } from "~/components/TrimmedNumber";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { CopyButton } from "./ui/CopyButton";
import { logger } from "~/lib/log";

export function SelectWallet() {
	const { connectWallet } = useXverseWallet();
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
		<>
			{bitcoinWalletStatus}
			{suiWalletStatus}
		</>
	);
}

const walletBadgeStyle = "btn btn-sm btn-primary btn-outline";

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

export function WalletOverviewModal() {
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
				<button className={walletBadgeStyle} aria-label="Wallet Overview">
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
							<Bitcoin className="text-primary-foreground" size={20} />
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

							<button onClick={disconnectWallet} className="btn btn-error btn-sm mt-2 w-auto">
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
								className="btn btn-error btn-sm mt-2 w-auto"
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
						onSuccess: () =>
							logger.debug({
								msg: "Switched to account",
								method: "SelectWallet",
								address: newAccount.address,
							}),
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

function SuiNetworkOptions() {
	const location = useLocation();
	const pathname = location.pathname;

	const { network, selectNetwork } = useSuiNetwork();
	const handleChange = useCallback(
		(value: string) => {
			selectNetwork(value as "testnet" | "mainnet" | "localnet");
		},
		[selectNetwork],
	);

	const isDevMode = !isProductionMode();
	const isAuctionPathname = pathname === "/beelievers-auction" && !isDevMode;

	const networks = useMemo(() => {
		if (isAuctionPathname) {
			return [{ label: "Mainnet", value: "mainnet" }];
		}

		const baseNetworks = [{ label: "Testnet", value: "testnet" }];

		// Add localnet option in dev mode
		if (isDevMode) {
			baseNetworks.unshift({ label: "Localnet", value: "localnet" });
		}

		return baseNetworks;
	}, [isAuctionPathname, isDevMode]);

	return (
		<SelectInput
			options={networks}
			placeholder="Select network"
			onValueChange={handleChange}
			value={network}
		/>
	);
}

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
