import { CopyButton } from "~/components/ui/CopyButton";
import { Tooltip } from "~/components/ui/tooltip";
import { trimAddress } from "~/components/Wallet/walletHelper";
import { useNetworkVariables } from "~/networkConfig";

interface BuildSuiTransactionUrlProps {
	suiTxId: string;
	explorerUrl?: string;
	configExplorerUrl?: string;
}

export function BuildSuiTransactionUrl({
	suiTxId,
	explorerUrl,
	configExplorerUrl,
}: BuildSuiTransactionUrlProps) {
	const { explorer } = useNetworkVariables();
	const href =
		explorerUrl ||
		(configExplorerUrl ? `${configExplorerUrl}/txblock/${suiTxId}` : `${explorer}/txblock/${suiTxId}`);
	return (
		<Tooltip tooltip={suiTxId}>
			<div className="flex items-center gap-2 font-mono">
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="link link-hover link-primary text-sm text-white !no-underline"
				>
					{trimAddress(suiTxId)}
				</a>
				<CopyButton text={suiTxId} />
			</div>
		</Tooltip>
	);
}
