import { useCallback, useContext, useEffect, useState } from "react";
import Wallet, {
	AddressPurpose,
	BitcoinNetworkType,
	changeNetworkMethodName,
	connectMethodName,
	disconnectMethodName,
	getAddressesMethodName,
	getBalanceMethodName,
	getNetworkMethodName,
} from "sats-connect";
import type { Address } from "sats-connect";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { toast } from "~/hooks/use-toast";

export const useXverseConnect = () => {
	const { handleWalletConnect, toggleBitcoinModal } = useContext(WalletContext);

	const connectWallet = useCallback(async () => {
		try {
			toggleBitcoinModal(true);
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
				handleWalletConnect(Wallets.Xverse, true);
			} else {
				toast({
					title: "Wallet",
					description: "Failed to connect wallet",
					variant: "destructive",
				});
			}
		} catch (err) {
			console.error(err);
		}
	}, [handleWalletConnect, toggleBitcoinModal]);

	return { connectWallet };
};

export const useXverseWallet = () => {
	const { handleWalletConnect } = useContext(WalletContext);
	const [addressInfo, setAddressInfo] = useState<Address[]>([]);
	const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
	const isBitCoinWalletConnected = !!currentAddress;
	const [balance, setBalance] = useState<string>();
	// TODO: Default bitcoin network on connection is Regtest
	const [network, setNetwork] = useState<BitcoinNetworkType>(BitcoinNetworkType.Regtest);

	const getBalance = useCallback(async () => {
		try {
			const response = await Wallet.request(getBalanceMethodName, null);
			if (response.status === "success") {
				setBalance(response.result.total);
			} else {
				toast({
					title: "Balance",
					description: "Failed to get the balance",
					variant: "destructive",
				});
			}
		} catch (err) {
			console.log(err);
		}
	}, []);

	const getAddresses = useCallback(async () => {
		const response = await Wallet.request(getAddressesMethodName, {
			purposes: [AddressPurpose.Payment],
		});
		if (response.status === "success") {
			setAddressInfo(response.result.addresses);
			setCurrentAddress(response.result.addresses?.[0]);
		} else {
			toast({
				title: "Address",
				description: "Failed to fetch the address",
				variant: "destructive",
			});
		}
	}, []);

	const getNetworkStatus = useCallback(async () => {
		const response = await Wallet.request(getNetworkMethodName, null);
		if (response.status === "success") {
			setNetwork(response.result.bitcoin.name);
		} else {
			toast({
				title: "Network",
				description: "Failed to get network status",
				variant: "destructive",
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		async function getWalletStatus() {
			if (isBitCoinWalletConnected) {
				await getAddresses();
				await getBalance();
				await getNetworkStatus();
			} else {
				setAddressInfo([]);
				setCurrentAddress(null);
				setBalance(undefined);
			}
		}
		getWalletStatus();
	}, [getAddresses, getBalance, getNetworkStatus, isBitCoinWalletConnected, network]);

	const disconnectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(disconnectMethodName, null);
			if (response.status === "success") {
				setAddressInfo([]);
				handleWalletConnect(Wallets.Xverse, false);
				setCurrentAddress(null);
			} else
				toast({
					title: "Wallet",
					description: "Failed to disconnect wallet",
					variant: "destructive",
				});
		} catch (err) {
			console.log(err);
		}
	}, [handleWalletConnect]);

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
				setCurrentAddress(response.result.addresses?.[0]);
				handleWalletConnect(Wallets.Xverse, true);
			} else {
				toast({
					title: "Wallet",
					description: "Failed to connect wallet",
					variant: "destructive",
				});
			}
		} catch (err) {
			console.error(err);
		}
	}, [handleWalletConnect]);

	const switchNetwork = useCallback(async (newNetwork: BitcoinNetworkType) => {
		// Handle other networks normally
		const response = await Wallet.request(changeNetworkMethodName, {
			name: newNetwork,
		});
		if (response.status === "success") {
			setNetwork(newNetwork);
		} else {
			console.error("Failed to switch network:", response.error);
			toast({
				title: "Network",
				description: "Failed to switch network",
				variant: "destructive",
			});
		}
	}, []);

	return {
		balance,
		network,
		currentAddress,
		addressInfo,
		setCurrentAddress,
		refreshBalance: getBalance,
		disconnectWallet,
		switchNetwork,
		connectWallet,
	};
};
