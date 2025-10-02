import { useContext, useEffect } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { NBTCBalance } from "~/components/NBTCBalance";
import { Instructions } from "./Instructions";
import { BuyNBTCTabContent } from "./BuyNBTCTabContent";
import { SellNBTCTabContent } from "./SellNBTCTabContent";
import { ArrowUpRight } from "lucide-react";
import { useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import type { BalanceProps } from "~/types/balance";

export function BuyNBTC() {
	const { network } = useSuiClientContext();
	const { mutate: disconnect } = useDisconnectWallet();
	const { nbtc: nbtcCfg } = useNetworkVariables();

	const nbtcCoin = nbtcCfg.pkgId + nbtcCfg.coinType;
	const nbtcBalanceRes = useCoinBalance(nbtcCoin);
	const suiBalanceRes = useCoinBalance();

	const { isWalletConnected, suiAddr } = useContext(WalletContext);
	const isSuiWalletConnected = isWalletConnected(Wallets.SuiWallet);
	const transactionHistoryLink = `https://suiscan.xyz/testnet/account/${suiAddr}/tx-blocks`;

	// TODO: remove this after auction. enforce network change
	// TODO: use wallet API to switch the network
	const isMainnet = network === "mainnet";
	useEffect(() => {
		if (isMainnet) {
			disconnect();
		}
	}, [disconnect, isMainnet]);

	return (
		<div className="flex flex-col items-center gap-8 px-2 pt-2">
			<p className="max-w-96 text-center text-2xl font-semibold md:text-3xl">
				Native enables <span className="text-primary text-2xl md:text-3xl">BTCFi</span> in the{" "}
				<span className="text-primary text-2xl md:text-3xl">Web3 native</span> way!
			</p>
			<div className="card max-w-lg w-full">
				<div className="card-body p-6 text-white flex flex-col gap-4">
					{isSuiWalletConnected && <NBTCBalance balance={nbtcBalanceRes.balance} />}
					<Instructions />
					<BuyNBTCTabs
						nbtcBalanceRes={nbtcBalanceRes}
						suiBalanceRes={suiBalanceRes}
						nbtcCoin={nbtcCoin}
					/>
					{isSuiWalletConnected && (
						<a
							href={transactionHistoryLink}
							target="_blank"
							rel="noreferrer"
							className="text-primary flex items-center gap-1 hover:underline"
						>
							Check Transaction History
							<ArrowUpRight size="22" />
						</a>
					)}
				</div>
			</div>
		</div>
	);
}

// TODO: Ravindra, if we decide to use rounded tabs, then we need to update the theme / style to make it
// default for tabs-boxed, rather than specifying here
const renderTabHeader = (title: string, checked = false) => (
	<input
		type="radio"
		name="tab_nbtc_buy_sell"
		className="tab checked:bg-primary rounded-full"
		aria-label={title}
		defaultChecked={checked}
	/>
);

type BuyNBTCTabsProps = BalanceProps;

const BuyNBTCTabs = ({ nbtcBalanceRes, suiBalanceRes, nbtcCoin }: BuyNBTCTabsProps) => (
	<div className="tabs tabs-boxed rounded-full p-1">
		{renderTabHeader("Buy", true)}
		<div className="tab-content py-6">
			<BuyNBTCTabContent
				nbtcBalanceRes={nbtcBalanceRes}
				suiBalanceRes={suiBalanceRes}
				nbtcCoin={nbtcCoin}
			/>
		</div>
		{renderTabHeader("Sell")}
		<div className="tab-content py-6">
			<SellNBTCTabContent
				nbtcBalanceRes={nbtcBalanceRes}
				suiBalanceRes={suiBalanceRes}
				nbtcCoin={nbtcCoin}
			/>
		</div>
	</div>
);
