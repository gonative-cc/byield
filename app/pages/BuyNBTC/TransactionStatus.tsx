import { Check, CircleX } from "lucide-react";
import { classNames } from "~/tailwind";
import { Link } from "react-router";

interface TransactionStatusProps {
	isSuccess: boolean;
	txnId?: string;
	handleRetry: () => void;
}

export function TransactionStatus({ isSuccess, txnId, handleRetry }: TransactionStatusProps) {
	const Icon = isSuccess ? Check : CircleX;

	return (
		<div className="flex flex-col gap-4 rounded-lg p-4 text-white">
			<div className="flex flex-col items-center gap-2">
				<Icon
					className={classNames({
						"text-success": isSuccess,
						"text-error": !isSuccess,
					})}
					size={30}
				/>{" "}
				{isSuccess ? "Success" : "Failed"}
			</div>
			<div className="flex flex-col items-center gap-2">
				{txnId && (
					<Link
						target="_blank"
						to={`https://suiscan.xyz/testnet/tx/${txnId}`}
						rel="noreferrer"
						className="text-primary m-0 flex w-full max-w-fit justify-center p-0 text-sm"
					>
						Check Transaction Details
					</Link>
				)}
			</div>
			<button onClick={handleRetry} className="btn btn-primary">
				{isSuccess ? "Ok" : "Retry"}
			</button>
		</div>
	);
}
