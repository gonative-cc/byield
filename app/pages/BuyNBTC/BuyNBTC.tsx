import { useContext, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { NBTCBalance } from "~/components/NBTCBalance";
import { Instructions } from "./Instructions";
import { BuyNBTCTabContent } from "./BuyNBTCTabContent";
import { SellNBTCTabContent } from "./SellNBTCTabContent";
import { ArrowUpRight } from "lucide-react";
import { useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit";
import { Tabs } from "react-daisyui";

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
			<Card>
				<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
					{isSuiWalletConnected && <NBTCBalance balance={nBTCBalance} />}
					<Instructions />
					<Tabs>
						<Tabs.RadioTab name="buy_sell_nbtc" color="primary" label="Buy" defaultChecked={true}>
							<BuyNBTCTabContent />
						</Tabs.RadioTab>
						<Tabs.RadioTab name="buy_sell_nbtc" label="Sell" color="primary">
							<SellNBTCTabContent />
						</Tabs.RadioTab>
					</Tabs>
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
