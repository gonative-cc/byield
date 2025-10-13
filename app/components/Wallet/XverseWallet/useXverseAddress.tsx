import { useState, useEffect } from "react";
import Wallet, { getAddressesMethodName, AddressPurpose } from "sats-connect";
import type { Address } from "sats-connect";

export const useXverseAddress = () => {
	const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

	useEffect(() => {
		const connectWallet = async () => {
			try {
				const response = await Wallet.request(getAddressesMethodName, {
					purposes: [AddressPurpose.Payment],
				});
				if (response.status === "success") {
					setCurrentAddress(response.result.addresses?.[0]);
				}
			} catch (error) {
				console.error("Failed to get address:", error);
			}
		};
		connectWallet();
	}, []);

	return { currentAddress };
};
