import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { QueryMintTxResp, QueryRedeemTxsResp } from "~/server/nbtc/jsonrpc";
import type { BitcoinNetworkType } from "sats-connect";

export function useNBTCActions() {
	const mintTxFetcher = useActionFetcher<QueryMintTxResp>();
	const redeemTxsFetcher = useActionFetcher<QueryRedeemTxsResp>();
	const putRedeemTxFetcher = useActionFetcher();

	const queryMintTx = (network: BitcoinNetworkType, suiAddr?: string, btcAddr?: string) => {
		mintTxFetcher.execute({
			method: "queryMintTx",
			params: [network, suiAddr, btcAddr],
		});
	};

	const fetchRedeemTxs = (network: BitcoinNetworkType, suiAddr: string, setupId: number) => {
		redeemTxsFetcher.execute({
			method: "fetchRedeemTxs",
			params: [network, suiAddr, setupId],
		});
	};

	const putRedeemTx = (
		network: BitcoinNetworkType,
		setupId: number,
		txId: string,
		eventJson: string,
	) => {
		putRedeemTxFetcher.execute({
			method: "putRedeemTx",
			params: [network, setupId, txId, eventJson],
		});
	};

	const hasMintTxsError =
		mintTxFetcher.isIdle && mintTxFetcher.data === undefined && !mintTxFetcher.isLoading;
	const hasRedeemTxsError =
		redeemTxsFetcher.isIdle &&
		redeemTxsFetcher.data === undefined &&
		!redeemTxsFetcher.isLoading;

	return {
		mintTxs: {
			data: Array.isArray(mintTxFetcher.data) ? mintTxFetcher.data : [],
			isLoading: mintTxFetcher.isLoading,
			state: mintTxFetcher.state,
			isIdle: mintTxFetcher.isIdle,
			isError: hasMintTxsError,
		},
		queryMintTx,

		redeemTxs: {
			data: Array.isArray(redeemTxsFetcher.data) ? redeemTxsFetcher.data : [],
			isLoading: redeemTxsFetcher.isLoading,
			state: redeemTxsFetcher.state,
			isIdle: redeemTxsFetcher.isIdle,
			isError: hasRedeemTxsError,
		},
		fetchRedeemTxs,

		putRedeemTx,
	};
}
