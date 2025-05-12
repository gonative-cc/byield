import { useState, ReactNode, createContext, useCallback } from "react";
import { ByieldWallet } from "~/types";

interface WalletContextI {
	connectedWallet: ByieldWallet | null;
	handleWalletConnect: (walletToBeConnected: ByieldWallet | null) => void;
}

export const WalletContext = createContext<WalletContextI>({
	connectedWallet: null,
	handleWalletConnect: () => {},
});

export const ByieldWalletProvider = ({ children }: { children: ReactNode }) => {
	const [connectedWallet, setConnectedWallet] = useState<ByieldWallet | null>(null);

	const handleWalletConnect = useCallback((walletToBeConnected: ByieldWallet | null) => {
		setConnectedWallet(walletToBeConnected);
	}, []);

	return (
		<WalletContext.Provider
			value={{
				connectedWallet,
				handleWalletConnect,
			}}
		>
			{children}
		</WalletContext.Provider>
	);
};
