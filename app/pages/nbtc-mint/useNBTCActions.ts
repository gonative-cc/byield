import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { QueryMintTxResp, QueryRedeemTxsResp } from "~/server/nbtc/jsonrpc";
import type { BitcoinNetworkType } from "sats-connect";

export function useNBTCActions() {
	const mintTxFetcher = useActionFetcher<QueryMintTxResp>();
	const redeemTxsFetcher = useActionFetcher<QueryRedeemTxsResp>();
	const putRedeemTxFetcher = useActionFetcher();

	const queryMintTx = async (
		network: BitcoinNetworkType,
		suiAddr: string | null,
		btcAddr: string | null,
	) => {
		await mintTxFetcher.execute({
			method: "queryMintTx",
			params: [network, suiAddr, btcAddr],
		});
	};

	const fetchRedeemTxs = async (
		network: BitcoinNetworkType,
		suiAddr: string,
		setupId: number,
	) => {
		await redeemTxsFetcher.execute({
			method: "fetchRedeemTxs",
			params: [network, suiAddr, setupId],
		});
	};

	const putRedeemTx = async (
		network: BitcoinNetworkType,
		setupId: number,
		txId: string,
		eventJson: string,
	) => {
		await putRedeemTxFetcher.execute({
			method: "putRedeemTx",
			params: [network, setupId, txId, eventJson],
		});
	};

	return {
		mintTxs: {
			data: Array.isArray(mintTxFetcher.data) ? mintTxFetcher.data : [],
			isLoading: mintTxFetcher.isLoading,
			state: mintTxFetcher.state,
			isIdle: mintTxFetcher.isIdle,
		},
		queryMintTx,

		redeemTxs: {
			data: Array.isArray(redeemTxsFetcher.data) ? redeemTxsFetcher.data : null,
			isLoading: redeemTxsFetcher.isLoading,
			state: redeemTxsFetcher.state,
			isIdle: redeemTxsFetcher.isIdle,
		},
		fetchRedeemTxs,

		putRedeemTx,
	};
}
