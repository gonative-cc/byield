import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import { Button } from "../../ui/button";
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
import { useToast } from "~/hooks/use-toast";
import { Link } from "react-router";
import { Wallet } from "lucide-react";

interface InstallWalletProps {
	link: string;
	name: string;
}

function InstallWallet({ link, name }: InstallWalletProps) {
	return (
		<Link target="_blank" to={link} rel="noreferrer" className="m-0 p-0">
			<Button type="button" variant="link" className="p-0 m-0">
				Install {name}
			</Button>
		</Link>
	);
}

function AvailableWallets() {
	const { toast } = useToast();
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
					<div className="flex gap-2 w-full">
						<Button
							variant="ghost"
							type="button"
							onClick={() => walletConnectClick(installedWallet)}
							className="justify-between flex w-full text-primary h-16"
						>
							<img
								src={installedWallet.icon}
								alt={installedWallet.name}
								width={20}
								height={20}
							/>
							{installedWallet.name}
						</Button>
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
				<div key={wallet.name} className="flex justify-center w-full">
					<Button
						variant="ghost"
						type="button"
						onClick={() => walletConnectClick(wallet)}
						className="justify-between flex w-full text-primary h-16"
					>
						<img src={wallet.icon} alt={wallet.name} width={40} height={40} />
						{wallet.name}
					</Button>
				</div>
			))}
		</div>
	);
}

interface SuiModalProps {
	label?: string;
}

export function SuiModal({ label = "Connect Sui Wallet" }: SuiModalProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button" layout="oneLine" className="w-full md:w-fit">
					<Wallet /> {label}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Connect Sui Wallet</DialogTitle>
				</DialogHeader>
				<DialogDescription>Please select a wallet to connect</DialogDescription>
				<DialogDescription className="text-xs">
					P.S: ZK Login / Outh (accounts that are created using e-mail) are not supported.
				</DialogDescription>
				<DialogDescription className="text-xs">
					If you are accessing the app from mobile, please use wallet browser e.g Slush wallet
					browser.
				</DialogDescription>
				<AvailableWallets />
			</DialogContent>
		</Dialog>
	);
}
