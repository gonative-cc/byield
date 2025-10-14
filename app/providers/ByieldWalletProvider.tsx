import { useCurrentAccount } from "@mysten/dapp-kit";
import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
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
	connectedWallets: ConnectedWallets;
	network: Network;
	suiAddr: string | null;
	xverse: ReturnType<typeof useXverseWallet>;
	handleNetwork: (newNetwork: Network) => void;
	handleWalletConnect: (walletType: Wallets, isConnected: boolean) => void;
	toggleBitcoinModal: (show: boolean) => void;
	isWalletConnected: (walletType: Wallets) => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WalletContext = createContext<WalletContextI>({
	connectedWallets: { [Wallets.Xverse]: false, [Wallets.SuiWallet]: false },
	network: Network.TESTNET,
	suiAddr: null,
	xverse: {},
	handleNetwork: () => {},
	handleWalletConnect: () => {},
	toggleBitcoinModal: () => {},
	isWalletConnected: () => false,
} as any as WalletContextI);

export const ByieldWalletProvider = ({ children }: { children: ReactNode }) => {
	// TODO: default network is testnet. Change it to mainnet when app goes in prod
	const [network, setNetwork] = useState<Network>(Network.TESTNET);
	const [isModalHidden, setIsModalHidden] = useState<boolean>(true); // State to control modal visibility
	const currentAccount = useCurrentAccount();
	const xverse = useXverseWallet();
	const { currentAddress } = xverse;
	const isSuiWalletActive = !!currentAccount;
	const isBitcoinWalletActive = !!currentAddress;
	const observerRef = useRef<MutationObserver | null>(null);

	// current sui address
	const suiAddr = isSuiWalletActive ? currentAccount.address : null;

	const connectedWallets: ConnectedWallets = {
		[Wallets.Xverse]: isBitcoinWalletActive,
		[Wallets.SuiWallet]: isSuiWalletActive,
	};

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
				connectedWallets,
				network,
				xverse,
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
