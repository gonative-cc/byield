import {
	useAccounts,
	useCurrentAccount,
	useDisconnectWallet,
	useSuiClientContext,
	useSwitchAccount,
} from "@mysten/dapp-kit";
import { SelectInput, type Option } from "../../ui/select";
import { useCallback, useContext, useMemo } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { trimAddress } from "../walletHelper";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { formatSUI } from "~/lib/denoms";
import { useLocation } from "react-router";
import { isProductionMode } from "~/lib/appenv";
import { CopyButton } from "~/components/ui/CopyButton";
import { TrimmedNumber } from "~/components/TrimmedNumber";

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

function NetWorkOptions() {
	const location = useLocation();
	const pathname = location.pathname;

	const { network, selectNetwork } = useSuiClientContext();
	const handleChange = useCallback(
		(value: SuiNetwork) => {
			selectNetwork(value);
		},
		[selectNetwork],
	);

	// TODO: remove this after auction. enforce network change
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
			className="w-full md:w-1/4"
		/>
	);
}

function Accounts() {
	const { mutate: switchAccount } = useSwitchAccount();
	const accounts = useAccounts();
	const currentSelectedAccount = useCurrentAccount();

	const options: Option[] = useMemo(
		() => accounts.map((a) => ({ label: trimAddress(a.address), value: a.address })),
		[accounts],
	);

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

function SuiWalletMobileView({ balance }: { balance: bigint }) {
	const { mutate: disconnect } = useDisconnectWallet();
	const { handleWalletConnect } = useContext(WalletContext);

	return (
		<div className="flex w-full flex-col items-center gap-4 md:hidden">
			<div className="flex w-full justify-between gap-2">
				<NetWorkOptions />
				<Accounts />
			</div>
			<div className="flex w-full items-center justify-between gap-4">
				<p>
					<TrimmedNumber
						displayType="text"
						value={formatSUI(balance)}
						suffix=" SUI"
						className="text-primary shrink-0"
						prefix="Balance: "
					/>
				</p>
				<button
					onClick={() => {
						disconnect();
						handleWalletConnect(Wallets.SuiWallet, false);
					}}
					className="btn btn-primary"
				>
					Disconnect Sui Wallet
				</button>
			</div>
		</div>
	);
}

export function SuiWallet() {
	const { mutate: disconnect } = useDisconnectWallet();
	const { handleWalletConnect } = useContext(WalletContext);
	const { balance } = useCoinBalance();

	return (
		<>
			{/* handles md screen sizes */}
			<div className="hidden items-center gap-2 md:flex">
				<NetWorkOptions />
				<Accounts />
				<TrimmedNumber
					displayType="text"
					value={formatSUI(balance)}
					suffix=" SUI"
					className="shrink-0"
				/>
				<button
					onClick={() => {
						disconnect();
						handleWalletConnect(Wallets.SuiWallet, false);
					}}
					className="btn btn-primary"
				>
					Disconnect Sui Wallet
				</button>
			</div>
			{/* handles below md screen sizes */}
			<SuiWalletMobileView balance={balance} />
		</>
	);
}
