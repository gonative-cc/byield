import {
	useAccounts,
	useCurrentAccount,
	useDisconnectWallet,
	useSuiClientContext,
	useSwitchAccount,
} from "@mysten/dapp-kit";
import { SelectInput, type Option } from "../../ui/select";
import { Button } from "../../ui/button";
import { useCallback, useContext, useMemo } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { trimAddress } from "../walletHelper";
import { useSuiBalance } from "./useSuiBalance";
import { NumericFormat } from "react-number-format";
import { EllipsisVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { formatSUI } from "~/lib/denoms";

enum SuiNetwork {
	TestNet = "testnet",
	MainNet = "mainnet",
}

const SuiNetworkLabel: Record<SuiNetwork, string> = {
	[SuiNetwork.TestNet]: "Testnet",
	[SuiNetwork.MainNet]: "Mainnet",
};

function NetWorkOptions() {
	const { network, selectNetwork } = useSuiClientContext();
	const handleChange = useCallback(
		(value: SuiNetwork) => {
			selectNetwork(value);
		},
		[selectNetwork],
	);

	// TODO: we only support sui test net for now
	const suiWalletNetworks: Option[] = useMemo(
		() => [{ label: SuiNetworkLabel[SuiNetwork.TestNet], value: SuiNetwork.TestNet }],
		[],
	);

	return (
		<SelectInput
			options={suiWalletNetworks}
			placeholder="Select network"
			onValueChange={handleChange}
			value={network}
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
	const { balance } = useSuiBalance();

	return (
		<div className="flex w-full gap-1 items-center md:hidden">
			<NetWorkOptions />
			<Accounts />
			<Popover>
				<PopoverTrigger asChild>
					<EllipsisVertical size={50} />
				</PopoverTrigger>
				<PopoverContent className="w-60">
					<div className="grid gap-4">
						<p>
							Balance:{" "}
							{balance?.totalBalance && (
								<NumericFormat
									displayType="text"
									value={formatSUI(balance?.totalBalance)}
									suffix=" SUI"
									className="shrink-0 text-primary"
								/>
							)}
						</p>
						<Button
							onClick={() => {
								disconnect();
								handleWalletConnect(null);
							}}
						>
							Disconnect
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export function SuiWallet() {
	const { mutate: disconnect } = useDisconnectWallet();
	const { handleWalletConnect } = useContext(WalletContext);
	const { balance } = useSuiBalance();

	return (
		<>
			{/* handles md screen sizes */}
			<div className="hidden w-full gap-2 items-center md:flex">
				<NetWorkOptions />
				<Accounts />
				{balance?.totalBalance && (
					<NumericFormat
						displayType="text"
						value={formatSUI(balance?.totalBalance)}
						suffix=" SUI"
						className="shrink-0"
					/>
				)}
				<Button
					onClick={() => {
						disconnect();
						handleWalletConnect(null);
					}}
				>
					Disconnect
				</Button>
			</div>
			{/* handles below md screen sizes */}
			<SuiWalletMobileView />
		</>
	);
}
