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
import { mistToSui, trimAddress } from "~/util/util";
import { useSuiBalance } from "./useSuiBalance";

enum SuiNetwork {
	TestNet = "testnet",
	MainNet = "mainnet",
}

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
		() => [{ label: SuiNetwork.TestNet, value: SuiNetwork.TestNet }],
		[],
	);

	return (
		<SelectInput
			options={suiWalletNetworks}
			placeholder="Select network"
			onValueChange={handleChange}
			value={network}
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
		/>
	);
}

export function SuiWallet() {
	const { mutate: disconnect } = useDisconnectWallet();
	const { handleWalletConnect } = useContext(WalletContext);
	const { balance } = useSuiBalance();

	return (
		<>
			<NetWorkOptions />
			<Accounts />
			{balance?.totalBalance && (
				<span className="text-lg font-semibold">{mistToSui(Number(balance.totalBalance)) + " SUI"}</span>
			)}
			<Button
				onClick={() => {
					disconnect();
					handleWalletConnect(null);
				}}
			>
				Disconnect
			</Button>
		</>
	);
}
