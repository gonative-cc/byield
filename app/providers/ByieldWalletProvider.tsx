import { useCurrentAccount } from "@mysten/dapp-kit";
import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useXverseAddress } from "~/components/Wallet/XverseWallet/useXverseAddress";
import { Wallets } from "~/components/Wallet";

export enum Network {
	MAINNET = "mainnet",
	TESTNET = "testnet",
}

interface ConnectedWallets {
	[Wallets.Xverse]: boolean;
	[Wallets.SuiWallet]: boolean;
}

interface WalletContextI {
	isLoading: boolean;
	connectedWallets: ConnectedWallets;
	network: Network;
	suiAddr: string | null;
	handleNetwork: (newNetwork: Network) => void;
	handleWalletConnect: (walletType: Wallets, isConnected: boolean) => void;
	toggleBitcoinModal: (show: boolean) => void;
	isWalletConnected: (walletType: Wallets) => boolean;
}

export const WalletContext = createContext<WalletContextI>({
	isLoading: false,
	connectedWallets: {
		[Wallets.Xverse]: false,
		[Wallets.SuiWallet]: false,
	},
	network: Network.TESTNET,
	suiAddr: null,
	handleNetwork: () => {},
	handleWalletConnect: () => {},
	toggleBitcoinModal: () => {},
	isWalletConnected: () => false,
});

export const ByieldWalletProvider = ({ children }: { children: ReactNode }) => {
	// TODO: default network is testnet. Change it to mainnet when app goes in prod
	const [network, setNetwork] = useState<Network>(Network.TESTNET);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [connectedWallets, setConnectedWallets] = useState<ConnectedWallets>({
		[Wallets.Xverse]: false,
		[Wallets.SuiWallet]: false,
	});
	const [isModalHidden, setIsModalHidden] = useState<boolean>(true); // State to control modal visibility
	const currentAccount = useCurrentAccount();
	const { currentAddress } = useXverseAddress();
	const isSuiWalletActive = !!currentAccount;
	const isBitcoinWalletActive = !!currentAddress;
	const observerRef = useRef<MutationObserver | null>(null);
	// current sui address
	const suiAddr = isSuiWalletActive ? currentAccount.address : null;

	useEffect(() => {
		setIsLoading(() => true);
		// Update wallet states based on actual wallet connections
		setConnectedWallets((prev) => ({
			...prev,
			[Wallets.SuiWallet]: isSuiWalletActive,
			[Wallets.Xverse]: isBitcoinWalletActive,
		}));
		setIsLoading(() => false);
	}, [isBitcoinWalletActive, isSuiWalletActive, isModalHidden]);

	useEffect(() => {
		const updateModalVisibility = () => {
			const modal = document.getElementById("sats-connect-wallet-provider-selector");
			if (modal) {
				modal.style.display = isModalHidden ? "none" : "block";
			}
		};

		// Run immediately to set initial modal state
		updateModalVisibility();

		const observer = new MutationObserver(() => {
			updateModalVisibility();
		});
		observerRef.current = observer;
		// Attach observer to the modal DOM node here if needed
		observer.observe(document.body, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
		};
	}, [isModalHidden]);

	const handleWalletConnect = async (walletType: Wallets, isConnected: boolean): Promise<void> => {
		setConnectedWallets((prev) => ({
			...prev,
			[walletType]: isConnected,
		}));
		// Show bitcoin wallet modal when connecting Xverse
		if (walletType === Wallets.Xverse && isConnected) {
			setIsModalHidden(false);
		}
	};

	const handleNetwork = (newNetwork: Network) => {
		setNetwork(() => newNetwork);
	};

	const toggleBitcoinModal = (show: boolean) => {
		setIsModalHidden(() => !show);
	};

	// Helper function to check if a specific wallet is connected
	const isWalletConnected = (walletType: Wallets): boolean => {
		return connectedWallets[walletType];
	};

	return (
		<WalletContext.Provider
			value={{
				suiAddr,
				isLoading,
				connectedWallets,
				network,
				handleNetwork,
				handleWalletConnect,
				toggleBitcoinModal,
				isWalletConnected,
			}}
		>
			<style>
				{`
          #sats-connect-wallet-provider-selector {
            display: ${isModalHidden ? "none !important" : "block"};
          }
        `}
			</style>
			{children}
		</WalletContext.Provider>
	);
};
