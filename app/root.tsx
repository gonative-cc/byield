import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/cloudflare";
import "./tailwind.css";
import { NavBar } from "./components/NavBar";
import { networkConfig } from "./networkConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider as SuiWalletProvider } from "@mysten/dapp-kit";
import { Toaster } from "./components/ui/toaster";
import { Tooltip, TooltipProvider } from "./components/ui/tooltip";
import { ByieldWalletProvider } from "./providers/ByieldWalletProvider";
import { isProduction, printAppEnv } from "./lib/appenv";
import { useEffect } from "react";

const queryClient = new QueryClient();

export const links: LinksFunction = () => [
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

function GoogleAnalyics() {
	if (!isProduction()) return null;
	return (
		<>
			<script async src="https://www.googletagmanager.com/gtag/js?id=G-CNXYT4HED9"></script>
			<script>
				{
					"window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-CNXYT4HED9'); console.log('GA Connected');"
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
				<GoogleAnalyics />
				<Links />
			</head>
			<body className="min-h-screen bg-background antialiased">
				<NativeApp>{children}</NativeApp>
			</body>
		</html>
	);
}

function NativeApp({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		if (!isProduction()) {
			printAppEnv();
		}
	}, []);

	return (
		<>
			<div className="flex flex-col min-h-screen">
				<QueryClientProvider client={queryClient}>
					<SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
						<SuiWalletProvider autoConnect>
							<ByieldWalletProvider>
								<TooltipProvider>
									<Tooltip>
										<NavBar />
										<main className="flex-1 container mx-auto px-4 py-8">{children}</main>
										<Toaster />
									</Tooltip>
								</TooltipProvider>
							</ByieldWalletProvider>
						</SuiWalletProvider>
					</SuiClientProvider>
				</QueryClientProvider>
				<footer className="border-t py-4 text-center text-sm text-muted-foreground">
					© {new Date().getFullYear()} Native App
				</footer>
			</div>
			<ScrollRestoration />
			<Scripts />
		</>
	);
}

export default function App() {
	return <Outlet />;
}
