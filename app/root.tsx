import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/cloudflare";
import "./tailwind.css";
import { NavBar } from "./components/NavBar";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "./networkConfig";

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

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>

			<QueryClientProvider client={queryClient}>
				<SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
					<WalletProvider autoConnect>
						<NativeApp>{children}</NativeApp>
					</WalletProvider>
				</SuiClientProvider>
			</QueryClientProvider>
		</html>
	);
}

function NativeApp({ children }: { children: React.ReactNode }) {
	return (
		<body className="min-h-screen bg-background antialiased">
			<div className="flex flex-col min-h-screen">
				<NavBar />
				<main className="flex-1 container mx-auto px-4 py-8">{children}</main>
				<footer className="border-t py-4 text-center text-sm text-muted-foreground">
					© {new Date().getFullYear()} Native App
				</footer>
			</div>
			<ScrollRestoration />
			<Scripts />
		</body>
	);
}

export default function App() {
	return (
		<WalletProvider>
			<Outlet />;
		</WalletProvider>
	);
}
