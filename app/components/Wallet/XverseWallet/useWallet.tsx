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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useXverseAddress } from "./useXverseAddress";
import { storage } from "~/lib/storage";
import { logError, logger } from "~/lib/log";

const showToast = (title: string, description: string) =>
	toast({ title, description, variant: "destructive" });

const openXverseWalletModal = () => {
	document.getElementById("sats-connect-wallet-provider-selector")?.style.setProperty("display", "block");
};

export const useXverseWallet = () => {
	const { bitcoinAddress } = useXverseAddress();
	const [addressInfo, setAddressInfo] = useState<Address[]>([]);
	const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
	const [network, setNetwork] = useState<BitcoinNetworkType>(() => {
		const savedNetwork = storage.getXverseNetwork();
		return (savedNetwork as BitcoinNetworkType) || BitcoinNetworkType.Regtest;
	});
	const [isXverseInstalled, setIsXverseInstalled] = useState(false);
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
			logError({ msg: "Wallet connection error", method: "xverse:useWallet" }, err);
		}
	}, [queryClient]);

	const { data, refetch: getBalance } = useQuery({
		queryKey: ["BTCBalance", bitcoinAddress, network],
		queryFn: () => Wallet.request(getBalanceMethodName, null),
		enabled: isBitcoinConnected,
	});

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
	}, []);

	useEffect(() => {
		async function getWalletStatus() {
			if (isBitcoinConnected) {
				await Promise.all([getAddresses(), getNetworkStatus()]);
			} else {
				resetWalletState();
			}
			setIsXverseInstalled(typeof window !== "undefined" && "BitcoinProvider" in window);
		}
		getWalletStatus();
	}, [getAddresses, getNetworkStatus, isBitcoinConnected, resetWalletState, network]);

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
			logError({ msg: "Wallet disconnect", method: "xverse:useWallet" }, err);
		}
	}, [queryClient, resetWalletState]);

	const switchNetwork = useCallback(async (newNetwork: BitcoinNetworkType) => {
		const response = await Wallet.request(changeNetworkMethodName, { name: newNetwork });
		if (response.status === "success") {
			setNetwork(newNetwork);
			storage.setXverseNetwork(newNetwork);
		} else {
			logger.error({
				msg: "Failed to switch network",
				method: "xverse:useWallet",
				error: response.error,
			});
			showToast("Network", "Failed to switch network");
		}
	}, []);

	return {
		balance: data?.status === "success" ? data.result.total : null,
		network,
		currentAddress,
		isXverseInstalled,
		addressInfo,
		getBalance,
		setCurrentAddress,
		connectWallet,
		disconnectWallet,
		switchNetwork,
	};
};
