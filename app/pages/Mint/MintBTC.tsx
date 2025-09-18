import { Card, CardContent } from "../../components/ui/card";
import { BitcoinBalance } from "../../components/BitcoinBalance";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../components/form/FormInput";
import { useXverseConnect, useXverseWallet } from "../../components/Wallet/XverseWallet/useWallet";
import { useContext, useEffect, useState } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { FormNumericInput } from "../../components/form/FormNumericInput";
import { BTC, formatBTC, parseBTC } from "~/lib/denoms";
import { nBTCMintTx } from "~/lib/nbtc";
import { Check } from "lucide-react";
import { buttonEffectClasses, classNames } from "~/util/tailwind";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { useNetworkVariables } from "~/networkConfig";
import { Modal } from "~/components/ui/dialog";
import { toast } from "~/hooks/use-toast";
import { setupBufferPolyfill } from "~/lib/buffer-polyfill";

interface TransactionStatusProps {
	SuiAddress: string;
	txId: string;
	handleRetry: () => void;
}

function TransactionStatus({ SuiAddress, txId, handleRetry }: TransactionStatusProps) {
	const { accountExplorer } = useNetworkVariables();
	const bitcoinConfig = useBitcoinConfig();
	const bitcoinBroadcastLink = `${bitcoinConfig.bitcoinBroadcastLink}${txId}`;
	const suiScanExplorerLink = `${accountExplorer}${SuiAddress}`;

	return (
		<div className="p-4 rounded-lg text-white flex flex-col gap-4">
			<div className="flex flex-col items-center gap-2">
				<Check
					className={classNames({
						"text-green-500": true,
					})}
					size={30}
				/>{" "}
				Success
				<a target="_blank" href={bitcoinBroadcastLink} rel="noreferrer" className="link link-primary">
					Track bitcoin transaction confirmation in explorer
				</a>
				<a target="_blank" href={suiScanExplorerLink} rel="noreferrer" className="link link-primary">
					Explore SUI coins
				</a>
			</div>

			<button className="btn btn-primary" onClick={handleRetry}>
				Ok
			</button>
		</div>
	);
}

function formatSuiAddress(suiAddress: string) {
	if (!suiAddress.toLowerCase().startsWith("0x")) {
		return "0x" + suiAddress;
	}
	return suiAddress;
}

const PERCENTAGES = [
	{
		id: "percentage-1",
		value: 25,
	},
	{
		id: "percentage-2",
		value: 50,
	},
	{
		id: "percentage-3",
		value: 75,
	},
	{
		id: "percentage-4",
		value: 100,
	},
];

function Percentage({ onChange }: { onChange: (value: number) => void }) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
			{PERCENTAGES.map(({ id, value }) => (
				<button
					key={id}
					onClick={() => onChange(value)}
					className="btn btn-primary btn-outline transition-all duration-200 hover:scale-105"
				>
					{value}%
				</button>
			))}
		</div>
	);
}
interface MintNBTCForm {
	numberOfBTC: string;
	suiAddress: string;
}

interface MintBTCProps {
	onTransactionBroadcast?: (txId: string, amountInSatoshi: number, suiAddress: string) => void;
}
export function MintBTC({ onTransactionBroadcast }: MintBTCProps = {}) {
	const [txId, setTxId] = useState<string | undefined>(undefined);
	const { connectWallet } = useXverseConnect();
	const { balance: walletBalance, currentAddress, network } = useXverseWallet();
	const { isWalletConnected, suiAddr } = useContext(WalletContext);
	const isBitCoinWalletConnected = isWalletConnected(Wallets.Xverse);
	const bitcoinConfig = useBitcoinConfig();

	const mintNBTCForm = useForm<MintNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			numberOfBTC: "",
			suiAddress: suiAddr || "",
		},
	});

	const { handleSubmit, watch, setValue } = mintNBTCForm;
	const SuiAddress = watch("suiAddress");

	useEffect(() => setValue("suiAddress", suiAddr || ""), [setValue, suiAddr]);

	useEffect(() => {
		setupBufferPolyfill();
	}, []);

	const handlenBTCMintTx = async ({ numberOfBTC, suiAddress }: MintNBTCForm) => {
		if (currentAddress) {
			if (!bitcoinConfig.nBTC || !bitcoinConfig.nBTC.depositAddress) {
				console.error("ERROR: Missing depositAddress in bitcoin config for network:", network);
				toast({
					title: "Network Configuration Error",
					description: `Missing deposit address for network ${network}. Please switch to TestnetV2, Mainnet, or Devnet for nBTC minting.`,
					variant: "destructive",
				});
				return;
			}

			const response = await nBTCMintTx(
				currentAddress,
				Number(parseBTC(numberOfBTC)),
				formatSuiAddress(suiAddress),
				network,
				bitcoinConfig.nBTC.depositAddress,
			);
			if (response && response.status === "success") {
				setTxId(response.result.txid);

				if (onTransactionBroadcast && response.result.txid) {
					const formattedSuiAddress = formatSuiAddress(suiAddress);
					onTransactionBroadcast(
						response.result.txid,
						Number(parseBTC(numberOfBTC)),
						formattedSuiAddress,
					);
				}
			}
		}
	};

	return (
		<FormProvider {...mintNBTCForm}>
			<form
				onSubmit={handleSubmit(async (form) => {
					handlenBTCMintTx({ ...form });
				})}
				className="w-full max-w-lg"
			>
				<Card className="w-full">
					<CardContent className="p-4 sm:p-6 rounded-lg text-white flex flex-col bg-azure-10 space-y-4">
						{isBitCoinWalletConnected && walletBalance && (
							<BitcoinBalance availableBalance={walletBalance} />
						)}
						<FormNumericInput
							required
							name="numberOfBTC"
							placeholder="Enter number of BTC"
							className="h-12 sm:h-16"
							inputMode="decimal"
							decimalScale={BTC}
							allowNegative={false}
							createEmptySpace
							rules={{
								validate: {
									isWalletConnected: () =>
										isBitCoinWalletConnected || "Please connect Bitcoin wallet",
									enoughBalance: (value: string) => {
										if (walletBalance) {
											if (parseBTC(value) <= BigInt(walletBalance)) {
												return true;
											}
											return "Not enough balance";
										}
									},
								},
							}}
						/>
						<Percentage
							onChange={(value: number) => {
								if (walletBalance) {
									const val = (BigInt(walletBalance) * BigInt(value)) / 100n;
									setValue("numberOfBTC", formatBTC(BigInt(val)));
								}
							}}
						/>
						<FormInput
							required
							name="suiAddress"
							placeholder="Enter destination Sui Address..."
							className="h-12 sm:h-16"
							createEmptySpace
							rules={{
								validate: {
									validateSuiAddress: (value: string) => {
										if (isValidSuiAddress(value)) {
											return true;
										}
										return "Enter valid Sui address";
									},
								},
							}}
						/>
						{isBitCoinWalletConnected ? (
							<button
								type="submit"
								className={classNames("btn btn-primary", buttonEffectClasses())}
							>
								Deposit BTC and mint nBTC
							</button>
						) : (
							<button onClick={connectWallet} className="btn btn-primary">
								Connect Bitcoin Wallet
							</button>
						)}
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
