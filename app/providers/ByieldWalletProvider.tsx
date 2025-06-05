import { useCurrentAccount } from "@mysten/dapp-kit";
import { ReactNode, createContext, useEffect, useState } from "react";
import { useXverseAddress } from "~/components/Wallet/XverseWallet/useXverseAddress";
import { ByieldWallet } from "~/types";

type WalletType = ByieldWallet | null | undefined;

interface WalletContextI {
	isLoading: boolean;
	connectedWallet: WalletType;
	handleWalletConnect: (walletToBeConnected: WalletType) => void;
}

export const WalletContext = createContext<WalletContextI>({
	isLoading: false,
	connectedWallet: null,
	handleWalletConnect: () => {},
});

export const ByieldWalletProvider = ({ children }: { children: ReactNode }) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [connectedWallet, setConnectedWallet] = useState<WalletType>();
	const currentAccount = useCurrentAccount();
	// check if SUI connection is active
	const isSuiWalletActive = currentAccount !== null;
	// check if bitcoin wallet is active
	const { currentAddress } = useXverseAddress();
	const isBitcoinWalletActive = currentAddress !== null;

	useEffect(() => {
		setIsLoading(() => true);
		setConnectedWallet(() =>
			isSuiWalletActive ? ByieldWallet.SuiWallet : isBitcoinWalletActive ? ByieldWallet.Xverse : null,
		);
		setIsLoading(() => false);
	}, [isBitcoinWalletActive, isSuiWalletActive]);

	const handleWalletConnect = async (walletToBeConnected: WalletType): Promise<void> => {
		setConnectedWallet(walletToBeConnected);
	};

	return (
		<WalletContext.Provider
			value={{
				isLoading,
				connectedWallet,
				handleWalletConnect,
			}}
		>
			{children}
		</WalletContext.Provider>
	);
};
