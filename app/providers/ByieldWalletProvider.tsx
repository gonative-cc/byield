import { useCurrentAccount } from "@mysten/dapp-kit";
import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useXverseAddress } from "~/components/Wallet/XverseWallet/useXverseAddress";
import { Wallets } from "~/components/Wallet";

type WalletType = Wallets | null | undefined;

export enum Network {
	MAINNET = "mainnet",
	TESTNET = "testnet",
}

interface WalletContextI {
	isLoading: boolean;
	connectedWallet: WalletType;
	network: Network;
	suiAddr: string | null;
	handleNetwork: (newNetwork: Network) => void;
	handleWalletConnect: (walletToBeConnected: WalletType) => void;
	toggleBitcoinModal: (show: boolean) => void;
}

export const WalletContext = createContext<WalletContextI>({
	isLoading: false,
	connectedWallet: null,
	network: Network.TESTNET,
	suiAddr: null,
	handleNetwork: () => {},
	handleWalletConnect: () => {},
	toggleBitcoinModal: () => {},
});

export const ByieldWalletProvider = ({ children }: { children: ReactNode }) => {
	// TODO: default network is testnet. Change it to mainnet when app goes in prod
	const [network, setNetwork] = useState<Network>(Network.TESTNET);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [connectedWallet, setConnectedWallet] = useState<WalletType>();
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
		// Update wallet state
		setConnectedWallet(() =>
			isSuiWalletActive ? Wallets.SuiWallet : isBitcoinWalletActive ? Wallets.Xverse : null,
		);
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

	const handleWalletConnect = async (walletToBeConnected: WalletType): Promise<void> => {
		setConnectedWallet(walletToBeConnected);
		// hide the bitcoin wallet from document DOM
		if (walletToBeConnected === Wallets.Xverse) {
			setIsModalHidden(false);
		}
	};

	const handleNetwork = (newNetwork: Network) => {
		setNetwork(() => newNetwork);
	};

	const toggleBitcoinModal = (show: boolean) => {
		setIsModalHidden(() => !show);
	};

	return (
		<WalletContext.Provider
			value={{
				suiAddr,
				isLoading,
				connectedWallet,
				network,
				handleNetwork,
				handleWalletConnect,
				toggleBitcoinModal,
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
