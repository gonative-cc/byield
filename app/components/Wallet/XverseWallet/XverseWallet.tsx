import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import { type Option, SelectInput } from "../../ui/select";
import { useMemo } from "react";
import { trimAddress } from "../walletHelper";
import { NumericFormat } from "react-number-format";
import { formatBTC } from "~/lib/denoms";
import { useLocation } from "react-router";
import { BitcoinNetworkType } from "sats-connect";
import { CopyButton } from "~/components/ui/CopyButton";

function NetWorkOptions() {
	const { network, switchNetwork } = useXverseWallet();

	const location = useLocation();
	const pathname = location.pathname;
	const isUserOnMintNBTCPage = pathname === "/mint";

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

	return (
		<SelectInput
			options={options}
			onValueChange={(address) => {
				const account = addressInfo.find((a) => a.address === address);
				if (account) setCurrentAddress(account);
			}}
			value={currentAddress?.address}
			optionItemRenderer={(val) => (
				<div className="flex gap-2 items-center">
					{val.label} <CopyButton text={val.value} />
				</div>
			)}
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
				<button onClick={disconnectWallet} className="btn btn-primary">
					Disconnect Bitcoin Wallet
				</button>
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
				<button onClick={disconnectWallet} className="btn btn-primary">
					Disconnect Bitcoin Wallet
				</button>
			</div>
			{/* Mobile view */}
			<XverseWalletMobileView />
		</>
	);
}
