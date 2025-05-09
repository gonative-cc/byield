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

function AvailableWallets() {
	const { toast } = useToast();
	const { handleWalletConnect } = useContext(WalletContext);
	const wallets = useWallets();
	const { mutate: connect } = useConnectWallet();

	if (!wallets.length)
		return <DialogDescription className="text-red-500">No wallet available to select</DialogDescription>;

	return (
		<div className="flex flex-col">
			{wallets.map((wallet) => (
				<div key={wallet.name} className="flex justify-center max-w-fit">
					<img src={wallet.icon} alt={wallet.name} width={20} height={20} />
					<Button
						variant="link"
						onClick={() => {
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
							);
						}}
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
				<DialogDescription>Please select the wallet</DialogDescription>
				<AvailableWallets />
			</DialogContent>
		</Dialog>
	);
}
