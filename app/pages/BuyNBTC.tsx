import { useContext } from "react";
import { Card, CardContent } from "../components/ui/card";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { useNBTCBalance } from "../components/Wallet/SuiWallet/useNBTCBalance";
import { NBTCBalance } from "../components/BuyNBTC/NBTCBalance";
import { Instructions } from "../components/BuyNBTC/Instructions";
import { BuyNBTCTabContent } from "../components/BuyNBTC/BuyNBTCTabContent";
import { SellNBTCTabContent } from "../components/BuyNBTC/SellNBTCTabContent";
import { Tabs } from "../components/ui/tabs";
import { ArrowUpRight } from "lucide-react";

export function BuyNBTC() {
	const { balance: nBTCBalance } = useNBTCBalance();
	const { connectedWallet, suiAddr } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === Wallets.SuiWallet;
	const transactionHistoryLink = `https://suiscan.xyz/testnet/account/${suiAddr}/tx-blocks`;

	return (
		<div className="flex flex-col items-center gap-8 px-2 pt-2">
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
					<a
						href={transactionHistoryLink}
						target="_blank"
						rel="noreferrer"
						className="flex gap-1 items-center text-primary hover:underline"
					>
						Check Transaction History
						<ArrowUpRight size="22" />
					</a>
				</CardContent>
			</Card>
		</div>
	);
}
