import { useQuery } from "@tanstack/react-query";
import Wallet, { getAddressesMethodName, AddressPurpose } from "sats-connect";
import type { Address } from "sats-connect";

const fetchXverseAddress = async (): Promise<Address | null> => {
	const response = await Wallet.request(getAddressesMethodName, {
		purposes: [AddressPurpose.Payment],
	});
	return response.status === "success" ? response.result.addresses?.[0] || null : null;
};

export const useXverseAddress = () => {
	const { data: bitcoinAddress } = useQuery({
		queryKey: ["xverse-address"],
		queryFn: fetchXverseAddress,
	});

	return { bitcoinAddress };
};
