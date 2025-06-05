import { useCurrentAccount } from "@mysten/dapp-kit";
import { ReactNode, createContext, useEffect, useState } from "react";
import { useXverseAddress } from "~/components/Wallet/XverseWallet/useXverseAddress";
import { ByieldWallet } from "~/types";

type WalletType = ByieldWallet | null | undefined;

interface WalletContextI {
	isLoading: boolean;
	connectedWallet: WalletType;
	handleWalletConnect: (walletToBeConnected: WalletType) => void;
	toggleBitcoinModal: (show: boolean) => void;
}

export const WalletContext = createContext<WalletContextI>({
	isLoading: false,
	connectedWallet: null,
	handleWalletConnect: () => {},
	toggleBitcoinModal: () => {},
});

export const ByieldWalletProvider = ({ children }: { children: ReactNode }) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [connectedWallet, setConnectedWallet] = useState<WalletType>();
	const [isModalHidden, setIsModalHidden] = useState<boolean>(true); // State to control modal visibility
	const currentAccount = useCurrentAccount();
	const isSuiWalletActive = !!currentAccount;
	const { currentAddress } = useXverseAddress();
	const isBitcoinWalletActive = !!currentAddress;

	useEffect(() => {
		setIsLoading(() => true);

		// Function to update bitcoin modal visibility
		const updateModalVisibility = () => {
			const modal = document.getElementById("sats-connect-wallet-provider-selector");
			if (modal) {
				modal.style.display = isModalHidden ? "none" : "block";
			}
		};

		// Run immediately to set initial modal state
		updateModalVisibility();

		// Set up MutationObserver to watch for modal being added dynamically
		const observer = new MutationObserver(() => {
			updateModalVisibility();
		});

		observer.observe(document.body, { childList: true, subtree: true });

		// Update wallet state
		setConnectedWallet(() =>
			isSuiWalletActive ? ByieldWallet.SuiWallet : isBitcoinWalletActive ? ByieldWallet.Xverse : null,
		);
		setIsLoading(() => false);

		// Cleanup observer on component unmount
		return () => observer.disconnect();
	}, [isBitcoinWalletActive, isSuiWalletActive, isModalHidden]);

	const handleWalletConnect = async (walletToBeConnected: WalletType): Promise<void> => {
		setConnectedWallet(walletToBeConnected);
		// hide the bitcoin wallet from document DOM
		if (walletToBeConnected === ByieldWallet.Xverse) {
			setIsModalHidden(false);
		}
	};

	const toggleBitcoinModal = (show: boolean) => {
		setIsModalHidden(!show);
	};

	return (
		<WalletContext.Provider
			value={{
				isLoading,
				connectedWallet,
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
