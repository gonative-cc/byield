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
import { useToast } from "~/hooks/use-toast";

export function useWallet() {
	const { toast } = useToast();
	const [addressInfo, setAddressInfo] = useState<Address[]>([]);
	const [balance, setBalance] = useState<string>();
	const [network, setNetwork] = useState<BitcoinNetworkType>(BitcoinNetworkType.Mainnet);
	const isConnected = addressInfo.length > 0;

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
	}, [toast]);

	const getAddresses = useCallback(async () => {
		const response = await Wallet.request(getAddressesMethodName, {
			purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
		});
		if (response.status === "success") {
			setAddressInfo(response.result.addresses);
		} else {
			toast({
				title: "Address",
				description: "Failed to fetch the address",
				variant: "destructive",
			});
		}
	}, [toast]);

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
	}, [toast]);

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
			} else {
				toast({
					title: "Wallet",
					description: "Failed to connect wallet",
					variant: "destructive",
				});
			}
		} catch (err) {
			console.log(err);
		}
	}, [getAddresses, toast]);

	const disconnectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(disconnectMethodName, null);
			if (response.status === "success") setAddressInfo([]);
			else
				toast({
					title: "Wallet",
					description: "Failed to disconnect wallet",
					variant: "destructive",
				});
		} catch (err) {
			console.log(err);
		}
	}, [toast]);

	const switchNetwork = useCallback(
		async (newNetwork: BitcoinNetworkType) => {
			const response = await Wallet.request(changeNetworkMethodName, {
				name: newNetwork,
			});
			if (response.status === "success") setNetwork(newNetwork);
			else {
				toast({
					title: "Network",
					description: "Failed to switch network",
					variant: "destructive",
				});
			}
		},
		[toast],
	);

	return {
		isConnected,
		balance,
		network,
		addressInfo,
		connectWallet,
		disconnectWallet,
		switchNetwork,
	};
}
