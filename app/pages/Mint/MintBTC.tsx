import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../components/form/FormInput";
import { useXverseConnect, useXverseWallet } from "../../components/Wallet/XverseWallet/useWallet";
import { useContext, useEffect, useState } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { FormNumericInput } from "../../components/form/FormNumericInput";
import { BTC, formatBTC, parseBTC, formatNBTC } from "~/lib/denoms";
import { nBTCMintTx } from "~/lib/nbtc";
import { BitcoinIcon } from "lucide-react";
import { buttonEffectClasses, classNames } from "~/util/tailwind";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { toast } from "~/hooks/use-toast";
import { setupBufferPolyfill } from "~/lib/buffer-polyfill";
import { TxConfirmationModal } from "~/components/ui/TransactionConfirmationModal";
import { makeReq } from "~/server/Mint/jsonrpc";
import { useFetcher } from "react-router";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { NBTCBalance } from "~/components/NBTCBalance";

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

interface FeeProps {
	mintingFee: bigint;
}

function Fee({ mintingFee }: FeeProps) {
	return (
		<div className="card card-border bg-base-300">
			<div className="card-body">
				<div className="flex justify-between text-sm">
					<span>Minting Fee</span>
					<div className="tooltip" data-tip="1 nSats = 0.00000001 nBTC">
						<span className="cursor-help">
							{mintingFee} nSats ({formatNBTC(mintingFee)} nBTC)
						</span>
					</div>
				</div>
			</div>
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
	const { balance: nBTCBalance } = useCoinBalance();
	const [txId, setTxId] = useState<string | undefined>(undefined);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const { connectWallet } = useXverseConnect();
	const { balance: walletBalance, currentAddress, network } = useXverseWallet();
	const { isWalletConnected, suiAddr } = useContext(WalletContext);
	const isBitCoinWalletConnected = isWalletConnected(Wallets.Xverse);
	const cfg = useBitcoinConfig();
	const postMintTxRPC = useFetcher();
	const mintTxFetcher = useFetcher();
	// we need to query available user UTXOs to properly construct deposit TX with OP_RETURN
	const userUtxosFetcher = useFetcher();
	const [pendingMint, setPendingMint] = useState<MintNBTCForm | null>(null);

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

	useEffect(() => {
		setupBufferPolyfill();
	}, []);

	useEffect(() => {
		if (pendingMint && userUtxosFetcher.data) {
			nBTCMintTx(
				currentAddress!,
				Number(parseBTC(pendingMint.numberOfBTC)),
				formatSuiAddress(pendingMint.suiAddress),
				network,
				cfg,

				userUtxosFetcher.data,
			).then(async (response) => {
				if (response?.status === "success") {
					setTxId(response.result.txid);
					setShowConfirmationModal(true);

					// ADD THIS: Post transaction to indexer
					if (response.result.txid) {
						await makeReq(postMintTxRPC, {
							method: "postNBTCTx",
							params: [network, response.result.txid],
						});
						fetchMintTxs();
					}
				}
			});
			setPendingMint(null);
		}
	}, [userUtxosFetcher.data, pendingMint]);

	const handlenBTCMintTx = async ({ numberOfBTC, suiAddress }: MintNBTCForm) => {
		if (currentAddress) {
			if (!cfg.nBTC.depositAddress) {
				console.error("ERROR: Missing depositAddress in bitcoin config for network:", network);
				toast({
					title: "Network Configuration Error",
					description: `Missing deposit address for network ${network}. Please switch to TestnetV2, Mainnet, or Devnet for nBTC minting.`,
					variant: "destructive",
				});
				return;
			}

			setPendingMint({ numberOfBTC, suiAddress });
			makeReq(userUtxosFetcher, { method: "queryUTXOs", params: [network, currentAddress.address] });
		}
	};

	return (
		<FormProvider {...mintNBTCForm}>
			<form
				onSubmit={handleSubmit(async (form) => {
					handlenBTCMintTx({ ...form });
				})}
				className="w-full"
			>
				<div className="card w-full">
					<div className="card-body p-4 sm:p-6 rounded-lg flex flex-col space-y-4">
						<NBTCBalance balance={nBTCBalance} />
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
						<Fee mintingFee={BigInt(cfg.nBTC.mintingFee)} />
						{isBitCoinWalletConnected ? (
							<button
								type="submit"
								className={classNames("btn btn-primary", buttonEffectClasses())}
							>
								Deposit BTC and mint nBTC
							</button>
						) : (
							<button onClick={connectWallet} className="btn btn-primary">
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
