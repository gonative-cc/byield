import { useCallback, useEffect, useState } from "react";
import Wallet, {
	Address,
	AddressPurpose,
	BitcoinNetworkType,
	changeNetworkMethodName,
	connectMethodName,
	disconnectMethodName,
	getBalanceMethodName,
} from "sats-connect";

export const useWallet = () => {
	const [addressInfo, setAddressInfo] = useState<Address[]>([]);
	const [balance, setBalance] = useState<string>();
	const [network, setNetwork] = useState<BitcoinNetworkType>(BitcoinNetworkType.Mainnet);
	const isConnected = addressInfo.length > 0;

	const getBalance = useCallback(async () => {
		try {
			const response = await Wallet.request(getBalanceMethodName, null);
			if (response.status === "success") {
				setBalance(response.result.total);
			}
		} catch (err) {
			console.log(err);
		}
	}, []);

	const getAddresses = useCallback(async () => {
		const response = await Wallet.request("getAddresses", {
			purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
		});
		if (response.status === "success") {
			setAddressInfo(response.result.addresses);
			await getBalance();
		}
	}, []);

	useEffect(() => {
		async function getWalletStatus() {
			await getAddresses();
		}
		getWalletStatus();
	}, [getBalance]);

	const connectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(connectMethodName, {
				permissions: [
					{
						type: "wallet",
						resourceId: "",
						actions: {},
					},
					{
						type: "account",
						resourceId: "",
						actions: {},
					},
				],
			});
			if (response.status === "success") {
				await getAddresses();
			}
		} catch (err) {
			console.log(err);
		}
	}, []);

	const disconnectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(disconnectMethodName, null);
			if (response.status === "success") setAddressInfo([]);
		} catch (err) {
			console.log(err);
		}
	}, []);

	const switchNetwork = useCallback(async (newNetwork: BitcoinNetworkType) => {
		await Wallet.request(changeNetworkMethodName, {
			name: newNetwork,
		});
		setNetwork(newNetwork);
	}, []);

	return { isConnected, balance, network, connectWallet, disconnectWallet, switchNetwork };
};
