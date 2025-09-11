import { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { formatBTC } from "~/lib/denoms";
import { MintingTxStatus, type MintTransaction } from "~/server/Mint/types";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { CopyButton } from "~/components/ui/CopyButton";
import { ExpandableTransactionDetails } from "~/components/ui/ExpandableTransactionDetails";

interface MintBTCTableProps {
	data: MintTransaction[];
}

export function MintBTCTable({ data }: MintBTCTableProps) {
	const { confirmationThreshold } = useBitcoinConfig();
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	const toggleRowExpansion = (bitcoinTxId: string) => {
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(bitcoinTxId)) {
			newExpanded.delete(bitcoinTxId);
		} else {
			newExpanded.add(bitcoinTxId);
		}
		setExpandedRows(newExpanded);
	};

	const getStatusText = (transaction: MintTransaction) => {
		const { status, numberOfConfirmation } = transaction;

		switch (status) {
			case MintingTxStatus.BROADCASTING:
				return "Broadcasting";
			case MintingTxStatus.CONFIRMING:
				return `Confirming (${numberOfConfirmation}/${confirmationThreshold})`;
			case MintingTxStatus.MINTING:
				return "Minting";
			case MintingTxStatus.MINTED:
				return "Minted";
			case MintingTxStatus.FAILED:
				return "Failed";
			default:
				return status;
		}
	};

	return (
		<div className="w-full space-y-4 relative z-0">
			{/* Header */}
			<div className="flex items-center gap-3 px-2 pt-4">
				<div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center">
					<span className="text-xl">₿</span>
				</div>
				<h2 className="text-2xl font-bold text-primary">nBTC Mint Transactions</h2>
			</div>

			{/* DaisyUI Table */}
			<div
				className="overflow-x-auto bg-base-100 rounded-2xl shadow-2xl border border-primary/10 relative"
				style={{ overflow: "visible" }}
			>
				<table className="table table-zebra w-full relative z-0">
					{/* Table Head */}
					<thead className="bg-gradient-to-r from-primary/10 to-primary/20 relative z-10">
						<tr className="text-base-content/80 font-semibold">
							<th className="text-left">
								<div className="flex items-center gap-2">
									Bitcoin TX
									<div
										className="tooltip tooltip-top"
										data-tip="The Bitcoin transaction ID that initiated the mint process"
									>
										<Info
											size="16"
											className="text-primary hover:text-orange-400 transition-colors cursor-help"
										/>
									</div>
								</div>
							</th>
							<th className="text-left">
								<div className="flex items-center gap-2">
									Amount
									<div
										className="tooltip tooltip-top"
										data-tip="The amount of Bitcoin being minted in BTC"
									>
										<Info
											size="16"
											className="text-primary hover:text-orange-400 transition-colors cursor-help"
										/>
									</div>
								</div>
							</th>
							<th className="text-left">
								<div className="flex items-center gap-2">
									Recipient
									<div
										className="tooltip tooltip-top"
										data-tip="The destination address for the nBTC tokens"
									>
										<Info
											size="16"
											className="text-primary hover:text-orange-400 transition-colors cursor-help"
										/>
									</div>
								</div>
							</th>
							<th className="text-left">
								<div className="flex items-center gap-2">
									Status
									<div
										className="tooltip tooltip-top"
										data-tip="Current status of the mint transaction"
									>
										<Info
											size="16"
											className="text-primary hover:text-orange-400 transition-colors cursor-help"
										/>
									</div>
								</div>
							</th>
							<th className="text-center">
								<div className="flex items-center justify-center gap-2">
									Details
									<div
										className="tooltip tooltip-left"
										data-tip="Click to expand transaction details"
									>
										<Info
											size="16"
											className="text-primary hover:text-orange-400 transition-colors cursor-help"
										/>
									</div>
								</div>
							</th>
						</tr>
					</thead>

					{/* Table Body */}
					<tbody>
						{data.length === 0 ? (
							<tr>
								<td colSpan={5} className="text-center py-12">
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
											<span className="text-2xl">📊</span>
										</div>
										<p className="text-base-content/60">No transactions available</p>
									</div>
								</td>
							</tr>
						) : (
							data.map((transaction, index) => {
								const isExpanded = expandedRows.has(transaction.bitcoinTxId);
								return (
									<>
										{/* Main Row */}
										<tr
											key={transaction.bitcoinTxId}
											className="hover:bg-primary/5 transition-all duration-200 animate-in slide-in-from-left-2"
											style={{ animationDelay: `${index * 50}ms` }}
										>
											{/* Bitcoin TX */}
											<td>
												<div
													className="tooltip tooltip-bottom"
													data-tip={transaction.bitcoinTxId}
												>
													<div className="flex items-center gap-2 font-semibold cursor-pointer">
														{trimAddress(transaction.bitcoinTxId)}
														<CopyButton text={transaction.bitcoinTxId} />
													</div>
												</div>
											</td>

											{/* Amount */}
											<td>
												<div className="flex items-center space-x-2 font-semibold">
													<span className="text-primary">
														{formatBTC(BigInt(transaction.amountInSatoshi || 0))}
													</span>
													<span className="text-base-content/60 text-sm">BTC</span>
												</div>
											</td>

											{/* Recipient */}
											<td>
												<div
													className="tooltip tooltip-bottom"
													data-tip={transaction.recipient || transaction.suiAddress}
												>
													<div className="flex items-center space-x-2 font-mono cursor-pointer">
														<span className="font-mono text-sm">
															{trimAddress(
																transaction.recipient ||
																	transaction.suiAddress,
															)}
														</span>
														<CopyButton
															text={
																transaction.recipient ||
																transaction.suiAddress
															}
														/>
													</div>
												</div>
											</td>

											{/* Status */}
											<td>
												<span className="font-semibold">
													{getStatusText(transaction)}
												</span>
											</td>

											{/* Details Toggle */}
											<td className="text-center">
												<button
													onClick={() =>
														toggleRowExpansion(transaction.bitcoinTxId)
													}
													className="btn btn-ghost btn-sm btn-circle"
													aria-label={
														isExpanded ? "Collapse details" : "Expand details"
													}
												>
													{isExpanded ? (
														<ChevronDown size={16} />
													) : (
														<ChevronRight size={16} />
													)}
												</button>
											</td>
										</tr>

										{/* Expanded Row Details */}
										{isExpanded && (
											<tr key={`${transaction.bitcoinTxId}-details`}>
												<td colSpan={5} className="p-0">
													<ExpandableTransactionDetails transaction={transaction} />
												</td>
											</tr>
										)}
									</>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
