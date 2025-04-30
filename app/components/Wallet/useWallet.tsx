import { useCallback, useEffect, useState } from "react";
import Wallet, {
	Address,
	AddressPurpose,
	BitcoinNetworkType,
	changeNetworkMethodName,
	connectMethodName,
	disconnectMethodName,
	getAddressesMethodName,
	getBalanceMethodName,
	getNetworkMethodName,
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
		const response = await Wallet.request(getAddressesMethodName, {
			purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
		});
		if (response.status === "success") {
			setAddressInfo(response.result.addresses);
		}
	}, []);

	const getNetworkStatus = useCallback(async () => {
		const response = await Wallet.request(getNetworkMethodName, null);
		if (response.status === "success") {
			setNetwork(response.result.bitcoin.name);
		}
	}, []);

	useEffect(() => {
		async function getWalletStatus() {
			await getAddresses();
			await getBalance();
			await getNetworkStatus();
		}
		getWalletStatus();
	}, [network]);

	const connectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(connectMethodName, {
				permissions: [
					{
						type: "wallet",
						resourceId: "",
						actions: {
							readNetwork: true,
						},
					},
					{
						type: "account",
						resourceId: "",
						actions: {
							read: true,
						},
					},
				],
			});
			if (response.status === "success") {
				await getAddresses();
			}
		} catch (err) {
			console.log(err);
		}
	}, [getAddresses]);

	const disconnectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(disconnectMethodName, null);
			if (response.status === "success") setAddressInfo([]);
		} catch (err) {
			console.log(err);
		}
	}, []);

	const switchNetwork = useCallback(async (newNetwork: BitcoinNetworkType) => {
		const response = await Wallet.request(changeNetworkMethodName, {
			name: newNetwork,
		});
		if (response.status === "success") setNetwork(newNetwork);
	}, []);

	return {
		isConnected,
		balance,
		network,
		addressInfo,
		connectWallet,
		disconnectWallet,
		switchNetwork,
	};
};
