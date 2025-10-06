import type { UseCoinBalanceResult } from "~/components/Wallet/SuiWallet/useBalance";

export interface BalanceProps {
	nbtcBalanceRes: UseCoinBalanceResult;
	suiBalanceRes: UseCoinBalanceResult;
}
