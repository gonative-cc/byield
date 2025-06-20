import { useContext } from "react";
import { Card, CardContent } from "../ui/card";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { parseSUI } from "~/lib/denoms";
import { useNBTCBalance } from "../Wallet/SuiWallet/useNBTCBalance";
import { NBTCBalance } from "./NBTCBalance";
import { Instructions } from "./Instructions";
import { BuyNBTCTabContent } from "./BuyNBTCTabContent";
import { SellNBTCTabContent } from "./SellNBTCTabContent";
import { Tabs } from "../ui/tabs";

const BUY_NBTC_GAS = parseSUI("0.01");

export function BuyNBTC() {
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === Wallets.SuiWallet;
	const { balance: nBTCBalance } = useNBTCBalance();

	return (
		<>
			<div className="flex flex-col items-center gap-8">
				<p className="md:text-3xl text-2xl text-center font-semibold max-w-96">
					Native enables <span className="text-2xl text-primary md:text-3xl">BTCFi</span> in the{" "}
					<span className="text-2xl text-primary md:text-3xl">Web3 native</span> way!
				</p>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						{isSuiWalletConnected && nBTCBalance && (
							<NBTCBalance balance={BigInt(nBTCBalance.totalBalance)} />
						)}
						<Instructions />
						<Tabs
							tabs={[
								{
									value: "buy",
									label: "Buy",
									content: <BuyNBTCTabContent />,
								},
								{
									value: "sell",
									label: "Sell",
									content: <SellNBTCTabContent />,
								},
							]}
						/>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
