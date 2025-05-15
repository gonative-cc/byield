import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { CoinBalance } from "@mysten/sui/client";
import { useEffect, useState } from "react";

// unfortunately, SUI doesn't have their own hook to get the balance at the moment
// useSuiBalance fetches the SUI balance in mist
export const useSuiBalance = () => {
	const [balance, setBalance] = useState<CoinBalance | null>(null);
	const suiClient = useSuiClient();
	const account = useCurrentAccount();

	useEffect(() => {
		async function fetchBalance() {
			if (!account) return;
			const currentBalance = await suiClient.getBalance({
				owner: account.address,
			});
			setBalance(currentBalance);
		}
		fetchBalance();
	}, [account, suiClient]);

	return balance;
};
