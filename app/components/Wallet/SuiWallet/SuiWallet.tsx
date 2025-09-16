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
import { NumericFormat } from "react-number-format";
import { formatSUI } from "~/lib/denoms";
import { useLocation } from "react-router";
import { isProductionMode } from "~/lib/appenv";

enum SuiNetwork {
	TestNet = "testnet",
	MainNet = "mainnet",
}

const SuiNetworkLabel: Record<SuiNetwork, string> = {
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
	const suiNetworks: Option<SuiNetwork>[] = useMemo(
		() =>
			isAuctionPathname
				? [{ label: SuiNetworkLabel[SuiNetwork.MainNet], value: SuiNetwork.MainNet }]
				: [{ label: SuiNetworkLabel[SuiNetwork.TestNet], value: SuiNetwork.TestNet }],
		[isAuctionPathname],
	);

	return (
		<SelectInput
			options={suiNetworks}
			placeholder="Select network"
			onValueChange={(value: SuiNetwork) => handleChange(value)}
			value={network as SuiNetwork}
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
			placeholder="Select account"
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
			className="w-full md:w-1/4"
		/>
	);
}

function SuiWalletMobileView() {
	const { mutate: disconnect } = useDisconnectWallet();
	const { handleWalletConnect } = useContext(WalletContext);
	const { balance } = useCoinBalance();

	return (
		<div className="flex w-full flex-col gap-4 items-center md:hidden">
			<div className="flex gap-2 w-full justify-between">
				<NetWorkOptions />
				<Accounts />
			</div>
			<div className="flex w-full items-center justify-between gap-4">
				<p>
					Balance:{" "}
					<NumericFormat
						displayType="text"
						value={formatSUI(balance)}
						suffix=" SUI"
						className="shrink-0 text-primary"
					/>
				</p>
				<button
					onClick={() => {
						disconnect();
						handleWalletConnect(Wallets.SuiWallet, false);
					}}
					className="btn btn-primary"
				>
					Disconnect
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
			<div className="hidden gap-2 items-center md:flex">
				<NetWorkOptions />
				<Accounts />
				<NumericFormat
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
					Disconnect
				</button>
			</div>
			{/* handles below md screen sizes */}
			<SuiWalletMobileView />
		</>
	);
}
