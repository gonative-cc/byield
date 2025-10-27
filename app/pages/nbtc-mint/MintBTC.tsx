import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../components/form/FormInput";
import { useXverseConnect, useXverseWallet } from "../../components/Wallet/XverseWallet/useWallet";
import { useEffect, useState } from "react";
import { FormNumericInput } from "../../components/form/FormNumericInput";
import { BTC, formatBTC, parseBTC } from "~/lib/denoms";
import { nBTCMintTx } from "~/lib/nbtc";
import { BitcoinIcon, Info } from "lucide-react";
import { buttonEffectClasses, classNames } from "~/util/tailwind";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { toast } from "~/hooks/use-toast";
import { TxConfirmationModal } from "~/components/ui/TransactionConfirmationModal";
import { makeReq } from "~/server/nbtc/jsonrpc";
import { useFetcher } from "react-router";
import type { UTXO } from "~/server/nbtc/types";
import { useCurrentAccount } from "@mysten/dapp-kit";

function formatSuiAddress(suiAddress: string) {
	if (!suiAddress.toLowerCase().startsWith("0x")) {
		return "0x" + suiAddress;
	}
	return suiAddress;
}

function Percentage({ onChange }: { onChange: (value: number) => void }) {
	const PERCENTAGES = [25, 50, 75, 100];
	return (
		<div className="grid grid-cols-4 gap-2">
			{PERCENTAGES.map((v) => (
				<button
					type="button"
					key={v}
					onClick={() => onChange(v)}
					className="btn btn-sm btn-secondary btn-outline"
				>
					{v}%
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
	fetchMintTxs: () => void;
}

export function MintBTC({ fetchMintTxs }: MintBTCProps) {
	const [txId, setTxId] = useState<string | undefined>(undefined);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const { connectWallet } = useXverseConnect();
	const { balance: walletBalance, currentAddress, network } = useXverseWallet();
	const isBitcoinConnected = !!currentAddress;
	const currentAccount = useCurrentAccount();
	const suiAddr = currentAccount?.address || null;
	const cfg = useBitcoinConfig();

	const utxosRPC = useFetcher<UTXO[]>();
	const postNbtcTxRPC = useFetcher();

	const mintNBTCForm = useForm<MintNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			numberOfBTC: "",
			suiAddress: suiAddr || "",
		},
	});

	const { handleSubmit, setValue } = mintNBTCForm;

	useEffect(() => setValue("suiAddress", suiAddr || ""), [setValue, suiAddr]);

	// Fetch UTXOs when wallet connects
	useEffect(() => {
		if (!currentAddress) return;

		makeReq(utxosRPC, {
			method: "queryUTXOs",
			params: [network, currentAddress.address],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentAddress, network]);

	// Event handler
	const handlenBTCMintTx = async ({ numberOfBTC, suiAddress }: MintNBTCForm) => {
		if (!currentAddress) return;

		if (!cfg.nBTC.depositAddress) {
			console.error({ msg: "Missing depositAddress in bitcoin config", network });
			toast({
				title: "Network Configuration Error",
				description: `Missing deposit address for network ${network}. Please switch to TestnetV2, Mainnet, or Devnet for nBTC minting.`,
				variant: "destructive",
			});
			return;
		}

		setIsProcessing(true);

		try {
			if (!utxosRPC.data || utxosRPC.data.length === 0) {
				throw new Error("No UTXOs available for transaction");
			}
			const response = await nBTCMintTx(
				currentAddress,
				Number(parseBTC(numberOfBTC)),
				formatSuiAddress(suiAddress),
				network,
				cfg,
				utxosRPC.data,
			);

			if (response?.status === "success") {
				const txid = response.result.txid;
				setTxId(txid);
				setShowConfirmationModal(true);
				await makeReq(postNbtcTxRPC, {
					method: "postNbtcTx",
					params: [network, txid!],
				});
				fetchMintTxs();
				await makeReq(utxosRPC, {
					method: "queryUTXOs",
					params: [network, currentAddress.address],
				});
			} else {
				throw new Error("Transaction signing failed");
			}
		} catch (error) {
			console.error({ msg: "nBTC mint transaction failed", error });
			toast({
				title: "Transaction Failed",
				description: error instanceof Error ? error.message : "Unknown error occurred",
				variant: "destructive",
			});
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<FormProvider {...mintNBTCForm}>
			<form onSubmit={handleSubmit(handlenBTCMintTx)} className="mx-auto max-w-lg">
				<div className="card">
					<div className="card-body flex flex-col space-y-4">
						<h2 className="text-center text-lg">Deposit BTC and mint nBTC on Sui</h2>
						<FormNumericInput
							required
							name="numberOfBTC"
							placeholder="Enter number of BTC"
							className="h-10 sm:h-14"
							inputMode="decimal"
							decimalScale={BTC}
							allowNegative={false}
							rules={{
								validate: {
									isWalletConnected: () =>
										isBitcoinConnected || "Please connect Bitcoin wallet",
									minimumAmount: (value: string) => {
										if (parseBTC(value) >= BigInt(cfg.minMintInSats)) {
											return true;
										}
										return `Minimum amount is ${formatBTC(cfg.minMintInSats)} BTC`;
									},
									enoughBalance: (value: string) => {
										if (walletBalance) {
											if (parseBTC(value) <= BigInt(walletBalance)) {
												return true;
											}
											return "Not enough balance";
										}
									},
									mintBelowFee: (value: string) => {
										if (walletBalance) {
											if (parseBTC(value) > BigInt(cfg.nBTC.mintingFee)) {
												return true;
											}
											return `Input should be greater than ${formatBTC(BigInt(cfg.nBTC.mintingFee))} BTC`;
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
							className="h-10 sm:h-14"
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

						<p className="flex items-center">
							Minting Fee: &nbsp; {cfg.nBTC.mintingFee} nSats &nbsp;
							<span className="tooltip cursor-help" data-tip="1 nSats = 0.00000001 nBTC">
								<Info size={18} />
							</span>
						</p>

						{isBitcoinConnected ? (
							<button
								type="submit"
								disabled={isProcessing}
								className={classNames(
									"btn btn-primary btn-wide",
									buttonEffectClasses(),
									isProcessing ? "loading" : "",
								)}
							>
								{isProcessing ? "Processing..." : "Deposit BTC"}
							</button>
						) : (
							<button
								type="button"
								onClick={connectWallet}
								className="btn btn-primary btn-wide"
							>
								<BitcoinIcon className="h-5 w-5" />
								Connect Bitcoin Wallet
							</button>
						)}
					</div>
				</div>
			</form>

			{txId && (
				<TxConfirmationModal
					isOpen={showConfirmationModal}
					onClose={() => setShowConfirmationModal(false)}
					txId={txId}
				/>
			)}
		</FormProvider>
	);
}
