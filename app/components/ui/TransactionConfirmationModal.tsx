import { CheckCircle, Clock, Info } from "lucide-react";
import { Modal } from "./dialog";
import { useBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { alertPrimaryClasses, gradientCardClasses } from "~/tailwind";

interface TxConfirmationModal {
	isOpen: boolean;
	onClose: () => void;
	txId: string;
}

export function TxConfirmationModal({ isOpen, onClose, txId: _txId }: TxConfirmationModal) {
	const bitcoinConfig = useBitcoinConfig();

	const blockTime = bitcoinConfig?.blockTimeSec;
	const confirmationDepth = bitcoinConfig?.confirmationDepth;
	const estimatedTime = Math.ceil((blockTime * confirmationDepth) / 60);

	return (
		<Modal
			id="tx-confirmation-modal"
			open={isOpen}
			title="Transaction Sent Successfully"
			handleClose={onClose}
		>
			<div className="space-y-4">
				<div className={alertPrimaryClasses()}>
					<CheckCircle size={20} className="text-white" />
					<span className="text-white">
						Your transaction has been broadcasted to the Bitcoin network
					</span>
				</div>

				<div className="divider" />

				<div>
					<h3 className="mb-3 text-lg font-semibold">What happens next?</h3>
					<p className="text-sm">
						Your transaction is now in the Bitcoin mempool and will be included in upcoming
						blocks. It needs <strong>{confirmationDepth} confirmations</strong> to be considered
						secure.
					</p>
				</div>

				<div className={gradientCardClasses()}>
					<div className="card-body p-4">
						<div className="mb-2 flex items-center gap-2">
							<Clock size={16} />
							<span className="text-sm font-medium">Timeline</span>
						</div>

						<div className="stats stats-horizontal bg-transparent shadow-none">
							<div className="stat p-2">
								<div className="stat-title text-xs">Block Time</div>
								<div className="stat-value text-base">{blockTime / 60} min</div>
							</div>
							<div className="stat p-2">
								<div className="stat-title text-xs">Confirmations</div>
								<div className="stat-value text-base">{confirmationDepth}</div>
							</div>
						</div>

						<div className="divider my-2"></div>
						<div className="text-center">
							<div className="text-xs opacity-70">Estimated completion time</div>
							<div className="text-primary text-xl font-bold">~{estimatedTime} minutes</div>
						</div>
					</div>
				</div>

				<div className={alertPrimaryClasses()}>
					<Info size={16} className="text-white" />
					<span className="text-white">
						Track your transaction progress in the table below. Your nBTC tokens will be minted
						automatically once confirmed.
					</span>
				</div>

				<div className="modal-action">
					<button onClick={onClose} className="btn btn-primary">
						Got it
					</button>
				</div>
			</div>
		</Modal>
	);
}
