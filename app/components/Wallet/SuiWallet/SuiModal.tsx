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
import { ByieldWallet } from "~/types";
import { useToast } from "~/hooks/use-toast";
import { Link } from "@remix-run/react";

function SlushWalletLink() {
	return (
		<Link target="_blank" to="https://slush.app/" rel="noreferrer" className="m-0 p-0">
			<Button type="button" variant="link" className="p-0 m-0">
				Install Slush Wallet
			</Button>
		</Link>
	);
}

function PhantomWalletLink() {
	return (
		<Link target="_blank" to="https://phantom.app/" rel="noreferrer" className="m-0 p-0">
			<Button type="button" variant="link" className="p-0 m-0">
				Install Phantom Wallet
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
					<SlushWalletLink />
					<PhantomWalletLink />
				</div>
			</>
		);
	}

	// Case 2: One wallet installed
	if (wallets.length === 1) {
		const installedWallet = slushWallet || phantomWallet;
		const otherWalletLink = slushWallet ? <PhantomWalletLink /> : <SlushWalletLink />;

		return (
			<div className="flex flex-col gap-1">
				{installedWallet && (
					<div className="flex gap-2">
						<img src={installedWallet.icon} alt={installedWallet.name} width={20} height={20} />
						<Button
							variant="link"
							onClick={() => {
								connect(
									{ wallet: installedWallet },
									{
										onSuccess: () => handleWalletConnect(ByieldWallet.SuiWallet),
										onError: () =>
											toast({
												title: "Sui Wallet Connect",
												description: `Failed to connect ${installedWallet.name}`,
												variant: "destructive",
											}),
									},
								);
							}}
							className="w-fit"
						>
							Connect to {installedWallet.name}
						</Button>
					</div>
				)}
				{otherWalletLink}
			</div>
		);
	}

	// Case 3: Both wallets installed
	return (
		<div className="flex flex-col">
			{wallets.map((wallet) => (
				<div key={wallet.name} className="flex justify-center max-w-fit">
					<img src={wallet.icon} alt={wallet.name} width={20} height={20} />
					<Button
						variant="link"
						onClick={() =>
							connect(
								{ wallet },
								{
									onSuccess: () => handleWalletConnect(ByieldWallet.SuiWallet),
									onError: () =>
										toast({
											title: "Sui Wallet Connect",
											description: `Failed to connect wallet ${wallet.name}`,
											variant: "destructive",
										}),
								},
							)
						}
						className="justify-start w-fit"
					>
						Connect to {wallet.name}
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
				<Button>Connect Sui Wallet</Button>
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
