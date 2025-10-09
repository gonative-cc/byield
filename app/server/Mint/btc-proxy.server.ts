import { protectedRPCProxy, type RPCConfig } from "../rpc-proxy.server";

const BITCOIN_CONFIG: RPCConfig = {
	authToken: "btc-proxy-secret-2025",
	maxRequests: 50,
	windowMs: 300000, // 5 minutes
};

export async function protectedBitcoinRPC(
	request: Request,
	bitcoinRpcUrl: string,
	path: string,
): Promise<Response> {
	return protectedRPCProxy(request, bitcoinRpcUrl, path, BITCOIN_CONFIG);
}
