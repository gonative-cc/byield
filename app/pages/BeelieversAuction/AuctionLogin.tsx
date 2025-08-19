import { useEffect } from "react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { Button } from "~/components/ui/button";
import { useFetcher } from "react-router";
import { makeReq } from "~/server/BeelieversAuction/jsonrpc";
import { toast } from "~/hooks/use-toast";

interface AuctionLoginProps {}

export function AuctionLogin({}: AuctionLoginProps) {
	const account = useCurrentAccount();
	const { mutate: signPersonalMessage, isPending } = useSignPersonalMessage();
	const fetcher = useFetcher<{ token?: string; error?: string }>();

	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data) {
			const data = fetcher.data;

			if (data.token) {
				toast({ title: "Login Successful!", description: "Welcome back." });
				localStorage.setItem("auctionAuthToken", data.token);
				window.location.reload();
			} else if (data.error) {
				toast({ title: "Login Failed", description: data.error, variant: "destructive" });
			}
		}
	}, [fetcher.state, fetcher.data]);

	const handleLogin = () => {
		if (!account) {
			toast({
				title: "Wallet Not Connected",
				description: "Please connect your wallet first.",
				variant: "warning",
			});
			return;
		}

		const message = `Welcome to the Beelievers Auction! Sign this message to prove you own this wallet. This will not cost any gas. Timestamp: ${Date.now()}`;
		const messageBytes = new TextEncoder().encode(message);

		signPersonalMessage(
			{ message: messageBytes },
			{
				onSuccess: (result) => {
					makeReq(fetcher, {
						method: "login",
						params: [account.address, result.signature, message],
					});
				},
				onError: (error) => {
					toast({
						title: "Signature Failed",
						description: error.message,
						variant: "destructive",
					});
				},
			},
		);
	};

	return (
		<div className="flex flex-col items-center justify-center text-center p-8 border border-primary/20 rounded-xl bg-azure-10 w-full max-w-md mx-auto">
			<img src="/assets/bee/bee-with-hammer.svg" alt="Auction Bee" className="w-24 h-24 mb-4" />
			<h2 className="text-2xl font-bold text-primary mb-2">Auction Access</h2>
			<p className="text-muted-foreground mb-6">
				Please sign in with your Sui wallet to view the auction and place bids.
			</p>
			<Button
				onClick={handleLogin}
				disabled={!account || isPending || fetcher.state !== "idle"}
				size="lg"
			>
				{isPending
					? "Check Wallet..."
					: fetcher.state !== "idle"
						? "Verifying..."
						: "Sign-In with Wallet"}
			</Button>
		</div>
	);
}
