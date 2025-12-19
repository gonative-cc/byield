import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import type { LinksFunction } from "react-router";
import tailwindStyle from "./tailwind.css?url";
import { WalletBar } from "~/components/Bar";
import { networkConfig } from "./networkConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider as SuiWalletProvider } from "@mysten/dapp-kit";
import { Toaster } from "~/components/ui/toaster";
import { isProductionMode, printAppEnv } from "./lib/appenv";
import { useEffect, useState } from "react";
import { Footer } from "~/components/Footer";
import { SideBarProvider } from "./providers/SiderBarProvider";
import { SideBar } from "~/components/SideBarMenu";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { storage } from "~/lib/storage";
import type { SuiNetwork } from "./hooks/useSuiNetwork";

const queryClient = new QueryClient();

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwindStyle },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

function GoogleAnalytics() {
	if (!isProductionMode()) return null;
	return (
		<>
			<script async src="https://www.googletagmanager.com/gtag/js?id=G-CNXYT4HED9"></script>
			<script>
				{
					"window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-CNXYT4HED9');"
				}
			</script>
		</>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<GoogleAnalytics />
				<Links />
			</head>
			<body>
				<SideBarProvider>
					<div className="flex h-screen w-full">
						<SideBar />
						<div className="flex w-full flex-col overflow-y-auto">
							<NativeApp>
								<WalletBar />
								{children}
							</NativeApp>
						</div>
					</div>
				</SideBarProvider>
			</body>
		</html>
	);
}

function NativeApp({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const pathname = location.pathname;

	const [suiNetwork, setSuiNetwork] = useState<SuiNetwork>();

	useEffect(() => {
		if (!isProductionMode()) {
			printAppEnv();
		}
	}, []);

	useEffect(() => {
		function getSuiNetwork() {
			const isAuctionPathname = pathname === "/beelievers-auction";
			// current user selected Sui network
			const currentNetwork = storage.getSuiNetwork();
			if (currentNetwork) {
				// force user to be on mainnet on auction page
				if (isProductionMode() && isAuctionPathname) {
					setSuiNetwork("mainnet");
					return;
				}
				setSuiNetwork(currentNetwork);
			} else {
				// defaults to testnet
				const defaultNet = isProductionMode() && isAuctionPathname ? "mainnet" : "testnet";
				setSuiNetwork(defaultNet);
			}
		}
		getSuiNetwork();
	}, [pathname, suiNetwork]);

	return (
		<>
			<div className="flex min-h-screen w-full flex-col gap-4">
				<QueryClientProvider client={queryClient}>
					<SuiClientProvider networks={networkConfig} network={suiNetwork}>
						<SuiWalletProvider autoConnect>
							<main className="flex-1">{children}</main>
							<Footer />
							<Toaster />
						</SuiWalletProvider>
					</SuiClientProvider>
				</QueryClientProvider>
			</div>
			<ScrollRestoration />
			<Scripts />
		</>
	);
}

export default function App() {
	return <Outlet />;
}

export { ErrorBoundary };
