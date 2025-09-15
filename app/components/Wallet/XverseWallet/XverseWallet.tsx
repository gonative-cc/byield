import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { Button } from "../../ui/button";
import { type Option, SelectInput } from "../../ui/select";
import { useMemo } from "react";
import { trimAddress } from "../walletHelper";
import { NumericFormat } from "react-number-format";
import { formatBTC } from "~/lib/denoms";
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";

function NetWorkOptions() {
	const { network, switchNetwork } = useXverseWallet();
	const bitcoinSupportedNetwork: Option[] = useMemo(
		() => [
			{ label: ExtendedBitcoinNetworkType.Testnet4, value: ExtendedBitcoinNetworkType.Testnet4 },
			{ label: ExtendedBitcoinNetworkType.Regtest, value: ExtendedBitcoinNetworkType.Regtest },
			{ label: ExtendedBitcoinNetworkType.Mainnet, value: ExtendedBitcoinNetworkType.Mainnet },
		],
		[],
	);

	return (
		<SelectInput
			options={bitcoinSupportedNetwork}
			onValueChange={(value) => switchNetwork(value as ExtendedBitcoinNetworkType)}
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

	return (
		<SelectInput
			options={options}
			placeholder="Select account"
			onValueChange={(address) => {
				const account = addressInfo.find((a) => a.address === address);
				if (account) setCurrentAddress(account);
			}}
			value={currentAddress?.address}
			className="w-full md:w-auto"
		/>
	);
}

function XverseWalletMobileView() {
	const { balance, disconnectWallet } = useXverseWallet();

	return (
		<div className="flex flex-col gap-4 items-center justify-between md:hidden">
			<div className="flex gap-2 w-full justify-between">
				<NetWorkOptions />
				<Accounts />
			</div>
			<div className="flex gap-4 items-center justify-between w-full">
				{balance && (
					<p>
						Balance:{" "}
						<NumericFormat
							displayType="text"
							value={formatBTC(BigInt(balance))}
							suffix=" BTC"
							className="shrink-0 text-primary"
						/>
					</p>
				)}
				<Button onClick={disconnectWallet}>Disconnect</Button>
			</div>
		</div>
	);
}

export function XverseWallet() {
	const { balance } = useXverseWallet();
	const { disconnectWallet } = useXverseWallet();

	return (
		<>
			<div className="hidden gap-2 items-center md:flex">
				<NetWorkOptions />
				<Accounts />
				{balance && (
					<NumericFormat
						displayType="text"
						value={formatBTC(BigInt(balance))}
						suffix=" BTC"
						className="shrink-0"
					/>
				)}
				<Button onClick={disconnectWallet} size="sm">
					Disconnect
				</Button>
			</div>
			{/* Mobile view */}
			<XverseWalletMobileView />
		</>
	);
}
