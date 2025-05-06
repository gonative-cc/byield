import { useWallet } from "~/components/Wallet/useWallet";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BitcoinNetworkType } from "sats-connect";

function NetWorkOptions() {
	const { network, switchNetwork } = useWallet();
	const handleChange = (value: BitcoinNetworkType) => {
		switchNetwork(value);
	};

	return (
		<Select onValueChange={handleChange} value={network}>
			<SelectTrigger className="bg-gray-800 w-1/4">
				<SelectValue placeholder="Funding Options" />
			</SelectTrigger>
			<SelectContent>
				{Object.values(BitcoinNetworkType).map((option) => (
					<SelectItem key={option} value={option}>
						{option}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export function Wallet() {
	const { isConnected, balance, connectWallet, disconnectWallet } = useWallet();

	if (!isConnected) {
		return <Button onClick={connectWallet}>Connect Bitcoin Wallet</Button>;
	}

	return (
		<>
			<NetWorkOptions />
			{isConnected && <span className="text-lg font-semibold">{balance}</span>}
			{isConnected && <Button onClick={disconnectWallet}>Disconnect Wallet</Button>}
		</>
	);
}
