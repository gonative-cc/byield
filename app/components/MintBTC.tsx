import { Card, CardContent } from "./ui/card";
import { BitcoinBalance } from "./BitcoinBalance";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "./form/FormInput";
import { useXverseConnect, useXverseWallet } from "./Wallet/XverseWallet/useWallet";
import { useContext, useEffect, useState } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { FormNumericInput } from "./form/FormNumericInput";
import { NumericFormat } from "react-number-format";
import { BTC, formatBTC, parseBTC } from "~/lib/denoms";
import { nBTCMintTx } from "~/lib/nbtc";
import { useToast } from "~/hooks/use-toast";
import { Modal } from "./ui/dialog";
import { Check } from "lucide-react";
import { classNames } from "~/util/tailwind";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { useNetworkVariables } from "~/networkConfig";

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
				<Link
					target="_blank"
					to={bitcoinBroadcastLink}
					rel="noreferrer"
					className="underline text-primary"
				>
					Track bitcoin transaction confirmation in explorer
				</Link>
				<Link
					target="_blank"
					to={suiScanExplorerLink}
					rel="noreferrer"
					className="underline text-primary"
				>
					Explore SUI coins
				</Link>
			</div>

			<Button onClick={handleRetry}>Ok</Button>
		</div>
	);
}

function formatSuiAddress(suiAddress: string) {
	if (suiAddress.toLowerCase().startsWith("0x")) {
		return suiAddress.substring(2);
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
		<div className="flex justify-between space-x-2 mb-4">
			{PERCENTAGES.map(({ id, value }) => (
				<Button
					type="button"
					key={id}
					onClick={() => onChange(value)}
					variant="ghost"
					className="bg-azure-10 w-full flex-1 flex"
				>
					{value}%
				</Button>
			))}
		</div>
	);
}

interface FeeProps {
	feeInSatoshi: bigint;
	youReceive: string;
}

function Fee({ feeInSatoshi, youReceive }: FeeProps) {
	return (
		<Card className="p-4 bg-azure-10 rounded-2xl h-24">
			<CardContent className="flex flex-col justify-between h-full p-0">
				<div className="flex justify-between">
					<p className="text-gray-400">Fixed Fee</p>
					<NumericFormat displayType="text" value={formatBTC(feeInSatoshi)} suffix=" Satoshi" />
				</div>
				<div className="flex justify-between">
					<p className="text-gray-400">You Receive</p>
					<NumericFormat displayType="text" value={youReceive} suffix=" nBTC" />
				</div>
			</CardContent>
		</Card>
	);
}

interface MintNBTCForm {
	numberOfBTC: string;
	suiAddress: string;
}

export function MintBTC() {
	const { toast } = useToast();
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

	const handlenBTCMintTx = async ({ numberOfBTC, suiAddress }: MintNBTCForm) => {
		if (currentAddress) {
			const response = await nBTCMintTx(
				currentAddress,
				Number(parseBTC(numberOfBTC)),
				formatSuiAddress(suiAddress),
				network,
				bitcoinConfig.nBTC.depositAddress,
				toast,
			);
			if (response && response.status === "success") {
				setTxId(response.result.txid);
			}
		}
	};

	return (
		<FormProvider {...mintNBTCForm}>
			<form
				onSubmit={handleSubmit(async (form) => {
					handlenBTCMintTx({ ...form });
				})}
				className="w-full md:w-1/2"
			>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col bg-azure-10">
						{isBitCoinWalletConnected && walletBalance && (
							<BitcoinBalance availableBalance={walletBalance} />
						)}
						<FormNumericInput
							required
							name="numberOfBTC"
							placeholder="Enter number of BTC"
							className="h-16"
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
							className="h-16"
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
							<Button type="submit">Deposit BTC and mint nBTC</Button>
						) : (
							<Button type="button" onClick={connectWallet}>
								Connect Bitcoin Wallet
							</Button>
						)}
						{txId && (
							<Modal
								title={"Mint BTC Transaction Status"}
								open
								handleClose={() => setTxId(() => undefined)}
							>
								<TransactionStatus
									handleRetry={() => setTxId(() => undefined)}
									txId={txId}
									SuiAddress={SuiAddress}
								/>
							</Modal>
						)}
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
