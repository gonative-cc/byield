import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { Button } from "../../ui/button";
import { type Option, SelectInput } from "../../ui/select";
import { BitcoinNetworkType } from "sats-connect";
import { useCallback, useMemo } from "react";
import { trimAddress } from "~/util/util";

function NetWorkOptions() {
	const { network, switchNetwork } = useXverseWallet();
	const handleChange = useCallback(
		(value: BitcoinNetworkType) => {
			switchNetwork(value);
		},
		[switchNetwork],
	);

	// TODO: currently only bitcoin test v4 is supported. This will be removed when app goes into production
	const bitcoinSupportedNetwork: Option[] = useMemo(
		() => [{ label: BitcoinNetworkType.Testnet4, value: BitcoinNetworkType.Testnet4 }],
		[],
	);

	return (
		<SelectInput
			options={bitcoinSupportedNetwork}
			onValueChange={handleChange}
			placeholder={"Select network"}
			value={network}
		/>
	);
}

function Accounts() {
	const { addressInfo, currentAddress, setCurrentAddress } = useXverseWallet();
	const options: Option[] = useMemo(
		() => addressInfo.map((a) => ({ label: trimAddress(a.address), value: a.address })),
		[addressInfo],
	);

	return (
		<SelectInput
			options={options}
			placeholder="Select account"
			onValueChange={(address) => {
				const newAccount = addressInfo.find((a) => a.address === address);
				if (!newAccount) return;
				setCurrentAddress(newAccount);
			}}
			value={currentAddress?.address}
		/>
	);
}

export function XverseWallet() {
	const { balance, disconnectWallet } = useXverseWallet();

	return (
		<>
			<NetWorkOptions />
			<Accounts />
			<span className="text-lg font-semibold">{balance}</span>
			<Button onClick={disconnectWallet}>Disconnect</Button>
		</>
	);
}
