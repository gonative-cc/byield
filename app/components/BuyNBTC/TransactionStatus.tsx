import { Check, CircleX } from "lucide-react";
import { classNames } from "~/util/tailwind";
import { Button } from "../ui/button";
import { Link } from "react-router";

interface TransactionStatusProps {
	isSuccess: boolean;
	txnId?: string;
	handleRetry: () => void;
}

export function TransactionStatus({ isSuccess, txnId, handleRetry }: TransactionStatusProps) {
	const Icon = isSuccess ? Check : CircleX;

	return (
		<div className="p-4 rounded-lg text-white flex flex-col gap-4">
			<div className="flex flex-col items-center gap-2">
				<Icon
					className={classNames({
						"text-green-500": isSuccess,
						"text-red-500": !isSuccess,
					})}
					size={30}
				/>{" "}
				{isSuccess ? "Success" : "Failed"}
			</div>
			<div className="flex flex-col gap-2 items-center">
				{isSuccess && (
					<div className="max-w-md mx-auto p-4 text-center">
						<p className="text-sm leading-relaxed">
							If you want to increase your chances to be whitelisted for BTCFi Beelievers NFT,
							please fill this{" "}
							<Link
								target="_blank"
								to="https://forms.gle/Hu4WUSfgQkp1xsyNA"
								rel="noreferrer"
								className="text-primary underline"
							>
								form.
							</Link>
						</p>
					</div>
				)}
				{txnId && (
					<Link
						target="_blank"
						to={`https://suiscan.xyz/testnet/tx/${txnId}`}
						rel="noreferrer"
						className="m-0 p-0 justify-center flex w-full text-primary max-w-fit text-sm"
					>
						Check Transaction Details
					</Link>
				)}
			</div>
			<Button onClick={handleRetry}>{isSuccess ? "Ok" : "Retry"}</Button>
		</div>
	);
}
