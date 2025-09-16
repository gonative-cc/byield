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

export function BuyNBTC() {
	const { network } = useSuiClientContext();
	const { mutate: disconnect } = useDisconnectWallet();

	// TODO: it doesn't get automatically refresehed
	const { balance: nBTCBalance } = useCoinBalance();
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
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-96">
				Native enables <span className="text-2xl text-primary md:text-3xl">BTCFi</span> in the{" "}
				<span className="text-2xl text-primary md:text-3xl">Web3 native</span> way!
			</p>
			<div className="card max-w-lg w-full">
				<div className="card-body p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
					{isSuiWalletConnected && <NBTCBalance balance={nBTCBalance} />}
					<Instructions />
					<BuyNBTCTabs />
					{isSuiWalletConnected && (
						<a
							href={transactionHistoryLink}
							target="_blank"
							rel="noreferrer"
							className="flex gap-1 items-center text-primary hover:underline"
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
		className="tab rounded-full checked:bg-primary"
		aria-label={title}
		defaultChecked={checked}
	/>
);

const BuyNBTCTabs = () => (
	<div className="tabs tabs-boxed bg-azure-10 rounded-full p-1">
		{renderTabHeader("Buy", true)}
		<div className="tab-content py-6">
			<BuyNBTCTabContent />
		</div>
		{renderTabHeader("Sell")}
		<div className="tab-content py-6">
			<SellNBTCTabContent />
		</div>
	</div>
);
