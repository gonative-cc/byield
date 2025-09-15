import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Wallet, {
	AddressPurpose,
	BitcoinNetworkType,
	changeNetworkMethodName,
	connectMethodName,
	disconnectMethodName,
	getAddressesMethodName,
	getBalanceMethodName,
	getNetworkMethodName,
	addNetworkMethodName,
} from "sats-connect";
import type { Address } from "sats-connect";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";
import { toast } from "~/hooks/use-toast";
import devnetConfig from "~/config/bitcoin-devnet.json";

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
	// Only toast on failure if we have not yet successfully fetched a balance
	const hasFetchedBalanceSuccessfullyRef = useRef<boolean>(false);

	const getBalance = useCallback(async () => {
		try {
			const response = await Wallet.request(getBalanceMethodName, null);
			if (response.status === "success") {
				setBalance(response.result.total);
				hasFetchedBalanceSuccessfullyRef.current = true;
			} else {
				if (!hasFetchedBalanceSuccessfullyRef.current) {
					toast({
						title: "Balance",
						description: "Failed to get the balance",
						variant: "destructive",
					});
				}
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
			setNetwork(response.result.bitcoin.name as unknown as ExtendedBitcoinNetworkType);
		} else {
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
				// Reset session success marker on disconnect
				hasFetchedBalanceSuccessfullyRef.current = false;
			}
		}
		getWalletStatus();
	}, [getAddresses, getBalance, getNetworkStatus, isBitCoinWalletConnected, network, currentAddress]);

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

	const addDevnetNetwork = useCallback(async () => {
		const name = ExtendedBitcoinNetworkType.Regtest;
		const res = await Wallet.request(addNetworkMethodName, {
			chain: "bitcoin",
			name,
			type: BitcoinNetworkType.Regtest,
			indexerUrl: devnetConfig.indexerUrl,
			rpcUrl: devnetConfig.rpcUrl,
		});
		if (res.status !== "success") {
			console.error(res.error);
			toast({
				title: "Network",
				description: `Failed to add Devnet network`,
				variant: "destructive",
			});
		}
	}, []);

	const switchNetwork = useCallback(
		async (newNetwork: ExtendedBitcoinNetworkType) => {
			// Handle Devnet separately as it needs to be added first
			if (newNetwork === ExtendedBitcoinNetworkType.Devnet) {
				await addDevnetNetwork();
				// Switch to Regtest after adding devnet
				const response = await Wallet.request(changeNetworkMethodName, {
					name: ExtendedBitcoinNetworkType.Regtest as unknown as BitcoinNetworkType,
				});
				if (response.status === "success") {
					setNetwork(ExtendedBitcoinNetworkType.Devnet);
				} else {
					console.error("Failed to switch to Devnet network:", response.error);
					toast({
						title: "Network",
						description: `Failed to switch to Devnet network`,
						variant: "destructive",
					});
				}
			} else {
				// Handle other networks normally
				const response = await Wallet.request(changeNetworkMethodName, {
					name: newNetwork as unknown as BitcoinNetworkType,
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
			}
		},
		[addDevnetNetwork],
	);

	return {
		balance,
		network,
		currentAddress,
		addressInfo,
		setCurrentAddress,
		refreshBalance: getBalance,
		disconnectWallet,
		switchNetwork,
	};
};
