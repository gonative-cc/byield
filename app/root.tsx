import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import tailwindStyle from "./tailwind.css?url";
import { NavBar } from "~/components/NavBar";
import { networkConfig } from "./networkConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider as SuiWalletProvider } from "@mysten/dapp-kit";
import { Toaster } from "~/components/ui/toaster";
import { ByieldWalletProvider } from "./providers/ByieldWalletProvider";
import { isProductionMode, printAppEnv } from "./lib/appenv";
import { useEffect } from "react";
import { Footer } from "~/components/Footer";
import { SideBarProvider } from "./providers/SiderBarProvider";
import { SideBar } from "./components/AppSideBar";

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
		<html lang="en" className="dark">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<GoogleAnalytics />
				<Links />
			</head>
			<body>
				<SideBarProvider>
					<div className="flex w-full">
						<SideBar />
						<div className="flex flex-col gap-2 w-full">
							<NativeApp>
								<NavBar />
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
	useEffect(() => {
		if (!isProductionMode()) {
			printAppEnv();
		}
	}, []);

	return (
		<>
			<div className="flex flex-col min-h-screen gap-4">
				<QueryClientProvider client={queryClient}>
					<SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
						<SuiWalletProvider autoConnect>
							<ByieldWalletProvider>
								<main className="flex-1">{children}</main>
								<Toaster />
							</ByieldWalletProvider>
						</SuiWalletProvider>
					</SuiClientProvider>
				</QueryClientProvider>
				<Footer />
			</div>
			<ScrollRestoration />
			<Scripts />
		</>
	);
}

export default function App() {
	return <Outlet />;
}
