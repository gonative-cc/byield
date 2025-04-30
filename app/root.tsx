import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/cloudflare";
import "./tailwind.css";
import { NavBar } from "./components/NavBar";
import { networkConfig } from "./networkConfig";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import '@mysten/dapp-kit/dist/index.css';

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
			<body className="min-h-screen bg-background antialiased">
				<NativeApp>{children}</NativeApp>
			</body>
		</html>
	);
}

function NativeApp({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="flex flex-col min-h-screen">
				<QueryClientProvider client={queryClient}>
					<SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
						<WalletProvider autoConnect>
							<NavBar />
							<main className="flex-1 container mx-auto px-4 py-8">{children}</main>
						</WalletProvider>
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
