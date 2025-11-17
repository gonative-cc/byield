import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import { toast } from "~/hooks/use-toast";
import { SUIIcon } from "~/components/icons";
import { Modal, ModalTriggerButton } from "~/components/ui/dialog";

interface InstallWalletProps {
	link: string;
	name: string;
}

function InstallWallet({ link, name }: InstallWalletProps) {
	return (
		<a target="_blank" href={link} rel="noreferrer" className="link link-primary">
			Install {name}
		</a>
	);
}

function AvailableWallets() {
	const wallets = useWallets();
	const { mutate: connect } = useConnectWallet();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const walletConnectClick = (installedWallet: any) => {
		connect(
			{ wallet: installedWallet },
			{
				onError: () =>
					toast({
						title: "Sui Wallet Connect",
						description: `Failed to connect ${installedWallet.name}`,
						variant: "destructive",
					}),
			},
		);
	};

	// Find Slush and Phantom wallets
	const slushWallet = wallets.find((w) => w.name === "Slush");
	const phantomWallet = wallets.find((w) => w.name === "Phantom");

	// Case 1: No wallets installed
	if (!slushWallet && !phantomWallet) {
		return (
			<>
				<span className="text-error">No Sui-compatible wallets detected</span>
				<div className="flex flex-col gap-1">
					<InstallWallet link="https://slush.app/" name="Slush" />
					<InstallWallet link="https://phantom.app/" name="Phantom" />
				</div>
			</>
		);
	}

	// Case 2: One wallet installed
	if (wallets.length === 1) {
		const installedWallet = slushWallet || phantomWallet;
		const otherWalletLink = slushWallet ? (
			<InstallWallet link="https://phantom.app/" name="Phantom" />
		) : (
			<InstallWallet link="https://slush.app/" name="Slush" />
		);

		return (
			<div className="flex flex-col gap-2">
				{installedWallet && (
					<div className="flex w-full gap-2">
						<button
							onClick={() => walletConnectClick(installedWallet)}
							className="btn btn-primary btn-soft flex h-16 w-full justify-between"
						>
							<img
								src={installedWallet.icon}
								alt={installedWallet.name}
								width={20}
								height={20}
							/>
							{installedWallet.name}
						</button>
					</div>
				)}
				{otherWalletLink}
			</div>
		);
	}

	// Case 3: Both wallets installed
	return (
		<div className="flex flex-col gap-2">
			{wallets.map((wallet) => (
				<div key={wallet.name} className="flex w-full justify-center">
					<button
						onClick={() => walletConnectClick(wallet)}
						className="btn btn-primary btn-soft flex h-16 w-full justify-between"
					>
						<img src={wallet.icon} alt={wallet.name} width={40} height={40} />
						{wallet.name}
					</button>
				</div>
			))}
		</div>
	);
}

export function SuiConnectModal() {
	const id = "sui-modal";
	return (
		<>
			<ModalTriggerButton id={id} className="btn-primary btn-sm">
				<SUIIcon prefix="" className="h-4 w-4" /> Connect Sui
			</ModalTriggerButton>
			<Modal
				id={id}
				title="Connect Sui Wallet"
				description="Please select a wallet to connect"
				className="sm:max-w-[425px]"
			>
				<p className="mb-4 text-xs">
					If you are accessing the app from mobile, please use wallet browser e.g Slush wallet
					browser.
				</p>
				<AvailableWallets />
			</Modal>
		</>
	);
}
