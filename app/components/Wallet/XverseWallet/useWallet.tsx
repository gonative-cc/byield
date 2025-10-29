import { useCallback, useEffect, useState } from "react";
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
import { toast } from "~/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useXverseAddress } from "./useXverseAddress";

const showToast = (title: string, description: string) =>
	toast({ title, description, variant: "destructive" });

const openXverseWalletModal = () => {
	document.getElementById("sats-connect-wallet-provider-selector")?.style.setProperty("display", "block");
};

export const useXverseWallet = () => {
	const { bitcoinAddress } = useXverseAddress();
	const [addressInfo, setAddressInfo] = useState<Address[]>([]);
	const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
	const [balance, setBalance] = useState<string>();
	const [network, setNetwork] = useState<BitcoinNetworkType>(BitcoinNetworkType.Regtest);
	const queryClient = useQueryClient();
	const isBitcoinConnected = !!bitcoinAddress;

	const connectWallet = useCallback(async () => {
		try {
			openXverseWalletModal();
			const response = await Wallet.request(connectMethodName, {
				permissions: [
					{ type: "wallet", resourceId: "", actions: { readNetwork: true } },
					{ type: "account", resourceId: "", actions: { read: true } },
				],
			});
			if (response.status === "success") {
				queryClient.invalidateQueries({ queryKey: ["xverse-address"] });
			} else {
				showToast("Wallet", "Failed to connect wallet");
			}
		} catch (err) {
			console.error(err);
		}
	}, [queryClient]);

	const getBalance = useCallback(async () => {
		try {
			const response = await Wallet.request(getBalanceMethodName, null);
			if (response.status === "success") {
				setBalance(response.result.total);
			} else {
				showToast("Balance", "Failed to get the balance");
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
			showToast("Address", "Failed to fetch the address");
		}
	}, []);

	const getNetworkStatus = useCallback(async () => {
		const response = await Wallet.request(getNetworkMethodName, null);
		if (response.status === "success") {
			setNetwork(response.result.bitcoin.name);
		} else {
			showToast("Network", "Failed to get network status");
		}
	}, []);

	const resetWalletState = useCallback(() => {
		setAddressInfo([]);
		setCurrentAddress(null);
		setBalance(undefined);
	}, []);

	useEffect(() => {
		async function getWalletStatus() {
			if (isBitcoinConnected) {
				await Promise.all([getAddresses(), getBalance(), getNetworkStatus()]);
			} else {
				resetWalletState();
			}
		}
		getWalletStatus();
	}, [getAddresses, getBalance, getNetworkStatus, isBitcoinConnected, resetWalletState, network]);

	const disconnectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(disconnectMethodName, null);
			if (response.status === "success") {
				resetWalletState();
				queryClient.invalidateQueries({ queryKey: ["xverse-address"] });
			} else {
				showToast("Wallet", "Failed to disconnect wallet");
			}
		} catch (err) {
			console.log(err);
		}
	}, [queryClient, resetWalletState]);

	const switchNetwork = useCallback(async (newNetwork: BitcoinNetworkType) => {
		const response = await Wallet.request(changeNetworkMethodName, { name: newNetwork });
		if (response.status === "success") {
			setNetwork(newNetwork);
		} else {
			console.error("Failed to switch network:", response.error);
			showToast("Network", "Failed to switch network");
		}
	}, []);

	return {
		balance,
		network,
		currentAddress,
		addressInfo,
		setCurrentAddress,
		refreshBalance: getBalance,
		connectWallet,
		disconnectWallet,
		switchNetwork,
	};
};
