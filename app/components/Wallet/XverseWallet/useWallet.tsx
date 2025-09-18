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
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";
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
	const { handleWalletConnect, isWalletConnected } = useContext(WalletContext);
	const isBitCoinWalletConnected = isWalletConnected(Wallets.Xverse);
	const [addressInfo, setAddressInfo] = useState<Address[]>([]);
	const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
	const [balance, setBalance] = useState<string>();
	// TODO: Default bitcoin network on connection is Testnet4
	const [network, setNetwork] = useState<ExtendedBitcoinNetworkType>(ExtendedBitcoinNetworkType.Testnet4);

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
			const walletNetworkName = response.result.bitcoin.name;

			const networkMapping: Record<string, ExtendedBitcoinNetworkType> = {
				Mainnet: ExtendedBitcoinNetworkType.Mainnet,
				Testnet: ExtendedBitcoinNetworkType.Testnet,
				Testnet4: ExtendedBitcoinNetworkType.Testnet4,
				Regtest: ExtendedBitcoinNetworkType.Regtest,
				testnet: ExtendedBitcoinNetworkType.Testnet4,
				mainnet: ExtendedBitcoinNetworkType.Mainnet,
			};

			const mappedNetwork = networkMapping[walletNetworkName] || ExtendedBitcoinNetworkType.TestnetV2;

			if (network !== mappedNetwork) {
				console.log("🔍 WALLET NETWORK CHANGED:");
				console.log("  - Wallet reported network:", walletNetworkName);
				console.log("  - Mapped to our internal type:", mappedNetwork);
			}

			setNetwork(mappedNetwork);
		} else {
			toast({
				title: "Network",
				description: "Failed to get network status",
				variant: "destructive",
			});
		}
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

	const switchNetwork = useCallback(async (newNetwork: ExtendedBitcoinNetworkType) => {
		// Map our internal network types to Xverse's BitcoinNetworkType enum
		const networkToXverseMapping: Record<ExtendedBitcoinNetworkType, BitcoinNetworkType | null> = {
			[ExtendedBitcoinNetworkType.Mainnet]: BitcoinNetworkType.Mainnet,
			[ExtendedBitcoinNetworkType.Testnet]: BitcoinNetworkType.Testnet,
			[ExtendedBitcoinNetworkType.Testnet4]: BitcoinNetworkType.Testnet4,
			[ExtendedBitcoinNetworkType.TestnetV2]: BitcoinNetworkType.Regtest, // TestnetV2 maps to Regtest
			[ExtendedBitcoinNetworkType.Regtest]: BitcoinNetworkType.Regtest,
			[ExtendedBitcoinNetworkType.Devnet]: null,
		};

		const xverseNetworkName = networkToXverseMapping[newNetwork];

		if (xverseNetworkName) {
			const response = await Wallet.request(changeNetworkMethodName, {
				name: xverseNetworkName,
			});
			if (response.status === "success") setNetwork(newNetwork);
			else {
				toast({
					title: "Network",
					description: "Failed to switch network",
					variant: "destructive",
				});
			}
		} else {
			// Handle Devnet case - just set the network state
			setNetwork(newNetwork);
		}
	}, []);

	return {
		balance,
		network,
		currentAddress,
		addressInfo,
		setCurrentAddress,
		disconnectWallet,
		switchNetwork,
	};
};
