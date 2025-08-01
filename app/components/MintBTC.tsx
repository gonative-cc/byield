import { Card, CardContent } from "./ui/card";
import { BitcoinBalance } from "./BitcoinBalance";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "./form/FormInput";
import { useXverseConnect, useXverseWallet } from "./Wallet/XverseWallet/useWallet";
import { useContext, useState } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { FormNumericInput } from "./form/FormNumericInput";
import { NumericFormat } from "react-number-format";
import { BTC, formatBTC, parseBTC } from "~/lib/denoms";
import { nBTCMintTxn } from "~/lib/nbtc";
import { networks } from "bitcoinjs-lib";
import { useToast } from "~/hooks/use-toast";
import { Modal } from "./ui/dialog";
import { Check } from "lucide-react";
import { classNames } from "~/util/tailwind";

interface TransactionStatusProps {
	txnId: string;
	handleRetry: () => void;
}

function TransactionStatus({ txnId, handleRetry }: TransactionStatusProps) {
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
					to={`https://mempool.space/testnet4/tx/${txnId}`}
					rel="noreferrer"
					className="underline text-primary"
				>
					Track confirmation in explorer
				</Link>
			</div>

			<Button onClick={handleRetry}>Ok</Button>
		</div>
	);
}

function remove0xPrefix(hexString: string) {
	if (hexString.toLowerCase().startsWith("0x")) {
		return hexString.substring(2);
	}
	return hexString;
}

const nBTCMintFeeInSatoshi = 10n;

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
	const { balance: walletBalance, currentAddress } = useXverseWallet();
	const { isWalletConnected } = useContext(WalletContext);
	const isBitCoinWalletConnected = isWalletConnected(Wallets.Xverse);
	const balance = parseBTC(walletBalance ?? "0");
	const mintNBTCForm = useForm<MintNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			numberOfBTC: "",
			suiAddress: "",
		},
	});

	const { handleSubmit, watch, setValue } = mintNBTCForm;

	const numberOfBTC = watch("numberOfBTC");
	// const youReceive = parseBTC(numberOfBTC || "0") - nBTCMintFeeInSatoshi;

	return (
		<FormProvider {...mintNBTCForm}>
			<form
				onSubmit={handleSubmit(async ({ numberOfBTC, suiAddress }) => {
					// TODO: Support for mainnet
					if (currentAddress) {
						const response = await nBTCMintTxn(
							currentAddress,
							Number(parseBTC(numberOfBTC)),
							remove0xPrefix(suiAddress),
							networks.testnet,
							toast,
						);
						if (response && response.status === "success") {
							setTxId(response.result.txid);
						}
					}
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
						/>
						{/* TODO: Add fee support in minting BTC */}
						{/* {youReceive && (
							<Fee feeInSatoshi={nBTCMintFeeInSatoshi} youReceive={formatBTC(youReceive)} />
						)} */}
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
									txnId={txId}
								/>
							</Modal>
						)}
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
