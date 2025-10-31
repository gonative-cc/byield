import { useEffect } from "react";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { NBTCBalance } from "~/components/NBTCBalance";
import { Instructions } from "./Instructions";
import { BuyNBTCTabContent } from "./BuyNBTCTabContent";
import { SellNBTCTabContent } from "./SellNBTCTabContent";
import { ArrowUpRight } from "lucide-react";
import { useCurrentAccount, useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";
import type { UseCoinBalanceResult } from "~/components/Wallet/SuiWallet/useBalance";
import { heroTitle } from "~/util/tailwind";

export function BuyNBTC() {
	const { network } = useSuiClientContext();
	const { mutate: disconnect } = useDisconnectWallet();
	const currentSuiAccount = useCurrentAccount();
	const nbtcBalanceRes = useCoinBalance("NBTC");
	const suiBalanceRes = useCoinBalance();

	const suiAddr = currentSuiAccount?.address || null;
	const isSuiWalletConnected = !!currentSuiAccount;
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
			<p className={heroTitle + " max-w-96"}>
				Native enables <span className="text-primary-foreground">BTCFi</span> in the{" "}
				<span className="text-primary-foreground">Web3 native</span> way!
			</p>
			<div className="card w-full max-w-lg">
				<div className="card-body flex flex-col gap-4 p-6 text-white">
					{isSuiWalletConnected && <NBTCBalance />}
					<Instructions />
					<BuyNBTCTabs nbtcBalanceRes={nbtcBalanceRes} suiBalanceRes={suiBalanceRes} />
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

type BuyNBTCTabsProps = {
	nbtcBalanceRes: UseCoinBalanceResult;
	suiBalanceRes: UseCoinBalanceResult;
};

const BuyNBTCTabs = ({ nbtcBalanceRes, suiBalanceRes }: BuyNBTCTabsProps) => (
	<div className="tabs tabs-boxed rounded-full p-1">
		{renderTabHeader("Buy", true)}
		<div className="tab-content py-6">
			<BuyNBTCTabContent nbtcBalanceRes={nbtcBalanceRes} suiBalanceRes={suiBalanceRes} />
		</div>
		{renderTabHeader("Sell")}
		<div className="tab-content py-6">
			<SellNBTCTabContent nbtcBalanceRes={nbtcBalanceRes} suiBalanceRes={suiBalanceRes} />
		</div>
	</div>
);
