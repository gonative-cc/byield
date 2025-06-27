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
import { Link } from "@remix-run/react";
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

	// Find Slush and Phantom wallets
	const slushWallet = wallets.find((w) => w.name === "Slush");
	const phantomWallet = wallets.find((w) => w.name === "Phantom");

	// Case 1: No wallets installed
	if (!slushWallet && !phantomWallet) {
		return (
			<>
				<DialogDescription className="text-red-500">No Sui-compatible wallets detected</DialogDescription>
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
							onClick={() => {
								connect(
									{ wallet: installedWallet },
									{
										onSuccess: () => handleWalletConnect(Wallets.SuiWallet),
										onError: () =>
											toast({
												title: "Sui Wallet Connect",
												description: `Failed to connect ${installedWallet.name}`,
												variant: "destructive",
											}),
									},
								);
							}}
							className="justify-between flex w-full text-primary h-16"
						>
							<img src={installedWallet.icon} alt={installedWallet.name} width={20} height={20} />
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
						onClick={() =>
							connect(
								{ wallet },
								{
									onSuccess: () => handleWalletConnect(Wallets.SuiWallet),
									onError: (error) => {
										console.error(`Failed to connect wallet ${wallet.name}`, error);
										toast({
											title: "Sui Wallet Connect",
											description: `Failed to connect wallet ${wallet.name}`,
											variant: "destructive",
										});
									},
								},
							)
						}
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

export function SuiModal() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<Wallet />
					Connect Sui Wallet
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Connect Sui Wallet</DialogTitle>
				</DialogHeader>
				<DialogDescription>Please select a wallet to connect</DialogDescription>
				<AvailableWallets />
			</DialogContent>
		</Dialog>
	);
}
