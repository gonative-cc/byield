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

export function getBitcoinNetworkConfig(network: ExtendedBitcoinNetworkType): Network | null {
	switch (network) {
		case ExtendedBitcoinNetworkType.Mainnet:
			return networks.bitcoin;
		case ExtendedBitcoinNetworkType.Regtest:
		case ExtendedBitcoinNetworkType.Devnet:
			return networks.regtest;
		case ExtendedBitcoinNetworkType.Testnet4:
		case ExtendedBitcoinNetworkType.TestnetV2:
			return networks.testnet;
		default:
			return null;
	}
}

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
	// TODO: Default bitcoin network on connection is TestnetV2 (with indexer)
	const [network, setNetwork] = useState<ExtendedBitcoinNetworkType>(ExtendedBitcoinNetworkType.TestnetV2);

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
		console.log("🔍 Current wallet network response:", response);

		if (response.status === "success") {
			const walletNetwork = response.result.bitcoin.name as unknown as ExtendedBitcoinNetworkType;
			console.log("🔍 Current wallet network:", walletNetwork);
			setNetwork(walletNetwork);
		} else {
			console.error("❌ Failed to get network status:", response);
			toast({
				title: "Network",
				description: "Failed to get network status",
				variant: "destructive",
			});
		}
	}, []);

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

	const switchNetwork = useCallback(
		async (newNetwork: ExtendedBitcoinNetworkType) => {
			// Map our custom networks to actual Bitcoin wallet networks
			const getWalletNetwork = (network: ExtendedBitcoinNetworkType): BitcoinNetworkType | null => {
				switch (network) {
					case ExtendedBitcoinNetworkType.Mainnet:
						return "Mainnet" as BitcoinNetworkType;
					case ExtendedBitcoinNetworkType.Testnet4:
					case ExtendedBitcoinNetworkType.TestnetV2: // TestnetV2 uses Testnet wallet network
						// Try "Testnet" instead of "Testnet4" - Xverse might use the older naming
						return "Testnet" as BitcoinNetworkType;
					case ExtendedBitcoinNetworkType.Regtest:
						return "Regtest" as BitcoinNetworkType;
					case ExtendedBitcoinNetworkType.Devnet:
					default:
						return null; // Custom networks don't switch wallet
				}
			};

			const walletNetwork = getWalletNetwork(newNetwork);

			if (walletNetwork) {
				try {
					console.log(
						`🔄 Attempting to switch wallet to: ${walletNetwork} (for app network: ${newNetwork})`,
					);
					console.log("🔍 Current network state:", network);

					const response = await Wallet.request(changeNetworkMethodName, {
						name: walletNetwork,
					});

					console.log("🔍 Wallet response:", response);
					if (response.status === "error") {
						console.error("🔍 Wallet error details:", response.error);
						console.error("🔍 Full error object:", JSON.stringify(response.error, null, 2));
					}

					if (response.status === "success") {
						setNetwork(newNetwork);
						toast({
							title: "Network Switched",
							description: `Switched to ${newNetwork}${newNetwork === ExtendedBitcoinNetworkType.TestnetV2 ? " (using Testnet4 wallet)" : ""}`,
							variant: "default",
						});
					} else {
						console.error("❌ Wallet network switch failed:", response);
						toast({
							title: "Network Switch Failed",
							description: `Failed to switch wallet network: ${response.error?.message || "Unknown error"}`,
							variant: "destructive",
						});
					}
				} catch (error) {
					console.error("❌ Network switch error:", error);
					toast({
						title: "Network Switch Error",
						description: `Error switching wallet network: ${error instanceof Error ? error.message : "Unknown error"}`,
						variant: "destructive",
					});
				}
			} else {
				// Handle custom networks (Devnet, etc.) - just set the app state
				setNetwork(newNetwork);
				toast({
					title: "Network Selected",
					description: `Selected ${newNetwork} (app-only configuration)`,
					variant: "default",
				});
			}
		},
		[network],
	);

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
