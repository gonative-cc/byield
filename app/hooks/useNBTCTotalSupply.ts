import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { useQuery } from "@tanstack/react-query";
import type { SuiJsonRpcClient } from "node_modules/@mysten/sui/dist/esm/jsonRpc/client";
import { formatNBTC } from "~/lib/denoms";
import { useNetworkVariables } from "~/networkConfig";
import type { ContractsCfg } from "~/config/sui/contracts-config";

async function getTotalNBTCSupply(
	suiClient: SuiJsonRpcClient,
	suiAddr: string,
	contract: ContractsCfg["nbtc"],
) {
	const txn = new Transaction();
	if (!suiAddr) return;
	txn.setSender(suiAddr);
	txn.moveCall({
		target: `${contract.pkgId}::nbtc::total_supply`,
		arguments: [txn.object(contract.contractId)],
	});

	const res = await suiClient.devInspectTransactionBlock({
		sender: suiAddr,
		transactionBlock: txn,
	});

	if (res.effects.status.status !== "success")
		throw new Error("Call failed: " + JSON.stringify(res.effects.status));

	const bytes = res.results?.[0].returnValues?.[0]?.[0];
	if (!bytes) throw new Error("No return value");

	const supply = bcs.u64().parse(new Uint8Array(bytes));

	return formatNBTC(BigInt(supply));
}

export const useNBTCTotalSupply = () => {
	const { nbtc } = useNetworkVariables();
	const currentAccount = useCurrentAccount();
	const suiAddr = currentAccount?.address || null;
	const suiClient = useSuiClient();

	const { data: totalSupply, isLoading } = useQuery({
		queryKey: ["nBTC-total-supply"],
		queryFn: () => getTotalNBTCSupply(suiClient, suiAddr!, nbtc),
		enabled: !!suiAddr,
	});

	return {
		totalSupply,
		isLoading,
	};
};
