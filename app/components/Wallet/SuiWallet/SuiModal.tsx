import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import {
	DialogHeader,
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "../../ui/dialog";
import { useContext } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { Wallets } from "~/components/Wallet";
import { toast } from "~/hooks/use-toast";
import { SUIIcon } from "~/components/icons";

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
	const { handleWalletConnect } = useContext(WalletContext);
	const wallets = useWallets();
	const { mutate: connect } = useConnectWallet();

	// WalletWithRequiredFeatures export is not available from @mysten/dapp-kit
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const walletConnectClick = (installedWallet: any) => {
		connect(
			{ wallet: installedWallet },
			{
				// TODO: onSuccess is not getting triggered. Have to check with SUI community.
				onSuccess: () => handleWalletConnect(Wallets.SuiWallet, true),
				onError: () =>
					toast({
						title: "Sui Wallet Connect",
						description: `Failed to connect ${installedWallet.name}`,
						variant: "destructive",
					}),
			},
		);
		// TODO: onSuccess is not getting triggered. Have to check with SUI community.
		handleWalletConnect(Wallets.SuiWallet, true);
	};

	// Find Slush and Phantom wallets
	const slushWallet = wallets.find((w) => w.name === "Slush");
	const phantomWallet = wallets.find((w) => w.name === "Phantom");

	// Case 1: No wallets installed
	if (!slushWallet && !phantomWallet) {
		return (
			<>
				<DialogDescription className="text-red-500">
					No Sui-compatible wallets detected
				</DialogDescription>
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
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button className="btn btn-primary btn-sm">
					<SUIIcon prefix="" className="h-4 w-4" /> Connect Sui
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Connect Sui Wallet</DialogTitle>
				</DialogHeader>
				<DialogDescription>Please select a wallet to connect</DialogDescription>
				<DialogDescription className="text-xs">
					If you are accessing the app from mobile, please use wallet browser e.g Slush wallet
					browser.
				</DialogDescription>
				<AvailableWallets />
			</DialogContent>
		</Dialog>
	);
}
