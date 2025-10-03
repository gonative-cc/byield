import { FormProvider, useForm } from 'react-hook-form';
import { useFetcher } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

import { formatSUI, parseSUI, SUI } from '~/lib/denoms';
import { delay } from '~/lib/batteries';
import { FormNumericInput } from '~/components/form/FormNumericInput';
import { FormInput } from '~/components/form/FormInput';
import { SuiModal } from '~/components/Wallet/SuiWallet/SuiModal';
import type { User } from '~/server/BeelieversAuction/types';
import { makeReq } from '~/server/BeelieversAuction/jsonrpc';
import { useCoinBalance } from '~/components/Wallet/SuiWallet/useBalance';
import { toast } from '~/hooks/use-toast';
import { useNetworkVariables } from '~/networkConfig';
import { SUIIcon } from '~/components/icons';
import { moveCallTarget, type BeelieversAuctionCfg } from '~/config/sui/contracts-config';
import {
	buttonEffectClasses,
	classNames,
	cardShowcaseClasses,
	cn,
	infoBoxClasses,
} from '~/util/tailwind';

const MINIMUM_FIRST_BID_MIST = 1e9;
interface NewTotalBidAmountProps {
	currentBidInMist: number;
	entryBidMist: number;
	additionalBidInSUI: string;
}

function NewTotalBidAmount({
	currentBidInMist,
	additionalBidInSUI,
	entryBidMist,
}: NewTotalBidAmountProps) {
	let newTotal = BigInt(currentBidInMist);
	let moreBidNeeded = BigInt(0);

	try {
		if (additionalBidInSUI) {
			const additionalAmount = parseSUI(additionalBidInSUI);
			newTotal = BigInt(currentBidInMist) + additionalAmount;
		}
		const remaining = BigInt(entryBidMist) - newTotal;
		moreBidNeeded = remaining > 0 ? remaining : BigInt(0);
	} catch {
		// any error
	}

	return (
		<div className={infoBoxClasses()}>
			<div className="mb-2 flex items-center justify-between">
				<span className="text-muted-foreground text-sm">New total bid amount:</span>
				<div className="text-primary text-lg font-semibold">{formatSUI(newTotal)} SUI</div>
			</div>
			{moreBidNeeded > 0 && (
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-sm">
						You need to add at least
						<span className="text-primary font-semibold">
							&nbsp; {formatSUI(moreBidNeeded)} SUI &nbsp;
						</span>
						to get into the winning list. Add more to increase your chance!
					</span>
				</div>
			)}
		</div>
	);
}

interface BeelieversBidForm {
	bid: string;
	note: string;
}

interface BeelieversBidProps {
	user?: User;
	entryBidMist: number;
}

const title = 'Bid NFT';

export function BeelieversBid({ user, entryBidMist }: BeelieversBidProps) {
	const { beelieversAuction } = useNetworkVariables();
	const client = useSuiClient();
	const account = useCurrentAccount();
	const suiBalanceRes = useCoinBalance();
	const fetcher = useFetcher();

	const { mutate: signAndExecTx, isPending, reset } = useSignAndExecuteTransaction();

	const bidForm = useForm<BeelieversBidForm>({
		mode: 'all',
		reValidateMode: 'onChange',
		defaultValues: {
			bid: '',
			note: '',
		},
	});

	if (account === null) return <SuiModal />;

	const onSubmit = bidForm.handleSubmit(async ({ bid, note }) => {
		const mistAmount = parseSUI(bid);
		const transaction = await createBidTxn(account.address, mistAmount, beelieversAuction);
		signAndExecTx(
			{ transaction },
			{
				onSuccess: async (result, _variables) => {
					console.log(
						'>>>> Bid tx submitted, digest: ',
						result.digest,
						'\n tx data:',
						result.bytes,
						'\n signature',
						result.signature,
					);

					// Probably we firstly need to wait for tx, before submitting to the server
					const { effects } = await client.waitForTransaction({
						digest: result.digest,
						options: { showEffects: true },
					});

					if (effects?.status.status === 'success') {
						// delay to accomodate network propagation for sending proof of the TX
						await delay(800);
						toast({ title, description: 'Bid successful' });
						makeReq(fetcher, {
							method: 'postBidTx',
							params: [account.address, result.bytes, result.signature, note],
						});
					} else {
						console.error('err', effects?.status.error);
						toast({
							title,
							description: 'Bid failed. Please try again later.\n',
							variant: 'destructive',
						});
					}
				},
				onError: (error) => {
					toast({
						title,
						description: 'Bid failed. Please try again later.\n' + error.message,
						variant: 'destructive',
					});
				},
				onSettled: () => {
					suiBalanceRes.refetch();
					reset();
				},
			},
		);
	});

	const hasUserBidBefore = (user && user.amount !== 0) || false;
	const bidInputInSUI = bidForm.watch('bid');

	return (
		<FormProvider {...bidForm}>
			<form onSubmit={onSubmit} className="flex w-full justify-center">
				<div className="w-full space-y-6 lg:w-2/3 xl:w-1/2">
					<div
						className={cn(
							cardShowcaseClasses(),
							'card animate-in slide-in-from-bottom-2 duration-700',
						)}
					>
						<div className="card-body from-azure-10 via-azure-15 to-azure-20 flex w-full flex-col gap-6 rounded-lg bg-gradient-to-br p-6 text-white lg:p-8">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="from-primary animate-pulse-glow flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r to-orange-400">
										<span className="text-2xl">🐝</span>
									</div>
									<div>
										<h2 className="text-primary text-2xl font-bold lg:text-3xl">Place Your Bid</h2>
										<p className="text-muted-foreground text-sm">
											{hasUserBidBefore
												? 'Increase your bid to improve your rank'
												: 'Join the auction and secure your NFT'}
										</p>
									</div>
								</div>
							</div>

							<div className="flex w-full flex-col space-y-4">
								<div className="space-y-2">
									<div className="text-foreground/80 text-sm font-medium">
										<span className="text-lg">💰 </span>
										{hasUserBidBefore
											? 'Enter SUI amount you want to add to your previous bid'
											: 'First-time bidders: minimum bid is 1 SUI'}
									</div>
									<FormNumericInput
										required
										name="bid"
										placeholder={
											hasUserBidBefore
												? 'Enter SUI amount you want to add'
												: 'Minimum: 1 SUI for the first bid'
										}
										className="border-primary/30 focus:border-primary hover:border-primary/50 h-14 text-lg transition-colors lg:h-16"
										inputMode="decimal"
										decimalScale={SUI}
										allowNegative={false}
										createEmptySpace
										rightAdornments={
											<SUIIcon
												prefix={'SUI'}
												className="mr-1 flex justify-end"
												containerClassName="w-full justify-end"
											/>
										}
										rules={{
											validate: (val: string) => validateBidAmount(val, hasUserBidBefore),
										}}
									/>
									{hasUserBidBefore && (
										<NewTotalBidAmount
											currentBidInMist={user?.amount || 0}
											additionalBidInSUI={bidInputInSUI}
											entryBidMist={entryBidMist}
										/>
									)}
								</div>
								<div className="space-y-2">
									<div className="text-foreground/80 flex items-center gap-2 text-sm font-medium">
										<span className="text-lg">📝</span>
										Message to Beelievers (optional)
									</div>
									<FormInput
										name="note"
										placeholder="Add a personal note (max 30 characters)..."
										className="border-primary/30 focus:border-primary hover:border-primary/50 h-14 transition-colors lg:h-16"
										createEmptySpace
										maxLength={30}
									/>
								</div>
								{submitButton(isPending, hasUserBidBefore)}
							</div>
						</div>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}

function submitButton(isPending: boolean, hasUserBidBefore: boolean) {
	return (
		<button
			disabled={isPending}
			className={classNames('btn btn-primary h-16 text-lg', buttonEffectClasses())}
		>
			<span className="flex items-center gap-2">
				{isPending ? (
					<LoaderCircle className="h-64 w-64 animate-spin" />
				) : (
					<>
						<span className="text-xl">🚀</span> {hasUserBidBefore ? 'Bid more' : 'Place Bid'}
					</>
				)}
			</span>
		</button>
	);
}

const createBidTxn = async (
	senderAddress: string,
	amountMist: bigint,
	cfg: BeelieversAuctionCfg,
): Promise<Transaction> => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	const [coin] = txn.splitCoins(txn.gas, [txn.pure.u64(amountMist)]);
	txn.moveCall({
		target: moveCallTarget(cfg, 'bid'),
		arguments: [txn.object(cfg.auctionId), coin, txn.object.clock()],
	});
	return txn;
};

function validateBidAmount(val: string, hasUserBidBefore: boolean) {
	let mistAmount = 0n;
	try {
		mistAmount = parseSUI(val);
	} catch (__error) {
		return 'wrong SUI number';
	}
	if (mistAmount < 1e6) {
		return 'minimum amount: 0.001';
	}
	if (!hasUserBidBefore && mistAmount < MINIMUM_FIRST_BID_MIST) {
		return 'First-time bidders must bid at least 1 SUI';
	}

	return true;
}
