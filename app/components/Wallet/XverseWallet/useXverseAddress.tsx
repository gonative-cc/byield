import { useState, useCallback, useEffect } from "react";
import Wallet, { Address, getAddressesMethodName, AddressPurpose } from "sats-connect";

export const useXverseAddress = () => {
	const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

	const connectWallet = useCallback(async () => {
		const response = await Wallet.request(getAddressesMethodName, {
			purposes: [AddressPurpose.Payment],
		});
		if (response.status === "success") {
			setCurrentAddress(response.result.addresses?.[0]);
		}
	}, []);

	useEffect(() => {
		connectWallet();
	}, [connectWallet]);

	return { currentAddress };
};
