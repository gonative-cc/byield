import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { XverseWallet } from "./Wallet/XverseWallet/XverseWallet";
import { SuiWallet } from "./Wallet/SuiWallet/SuiWallet";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";
import { BYieldNavigation } from "./ui/navigation-menu";
import { loader } from "~/root";

enum APP_THEME_MODE {
	LIGHT = "light",
	DARK = "dark",
}

interface SelectWalletProps {
	isAppModeProduction: boolean;
}

function SelectWallet({ isAppModeProduction }: SelectWalletProps) {
	const { connectWallet } = useXverseConnect();
	const { connectedWallet } = useContext(WalletContext);

	// none of the wallet is connected, than show connect button for all available wallets
	if (!connectedWallet) {
		return (
			<>
				{/* Xverse wallet connect button */}
				{isAppModeProduction && <Button onClick={connectWallet}>Connect Bitcoin Wallet</Button>}
				{/* Sui Wallet Connect Modal */}
				<SuiModal />
			</>
		);
	}

	// one of the wallet is connected
	return (
		<>
			{connectedWallet === ByieldWallet.Xverse && <XverseWallet />}
			{connectedWallet === ByieldWallet.SuiWallet && <SuiWallet />}
		</>
	);
}

export function NavBar() {
	const data = useLoaderData<typeof loader>();
	const isAppModeProduction = data.ENV.VITE_APP_MODE === "production";
	const [theme, setTheme] = useState<APP_THEME_MODE>(APP_THEME_MODE.DARK);
	useEffect(() => document.documentElement.classList.add(APP_THEME_MODE.DARK), []);

	const toggleTheme = useCallback(() => {
		const newTheme = theme === APP_THEME_MODE.LIGHT ? APP_THEME_MODE.DARK : APP_THEME_MODE.LIGHT;
		// remove current theme
		document.documentElement.classList.remove(theme);
		document.documentElement.classList.add(newTheme);
		setTheme(newTheme);
	}, [theme]);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav className="container mx-auto flex h-14 items-center">
				<Link to="/" className="font-bold text-lg">
					<div className="w-32">
						<img
							src="/assets/app-logos/logo-dark.svg"
							alt="Remix"
							className="hidden w-full dark:block"
						/>
					</div>
				</Link>
				<div className="flex flex-1 justify-center">
					<BYieldNavigation
						items={[
							{
								id: "navigation-1",
								title: "Buy nBTC",
								link: "/",
								hide: isAppModeProduction,
							},
							{
								id: "navigation-2",
								title: "Market",
								link: "/market",
								hide: isAppModeProduction,
							},
							{
								id: "navigation-3",
								title: "Mint nBTC",
								link: "/mint",
								hide: isAppModeProduction,
							},
						]}
					/>
				</div>
				<div className="flex flex-1 items-center justify-end gap-4">
					<SelectWallet isAppModeProduction={isAppModeProduction} />
					<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
						{theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
					</Button>
				</div>
			</nav>
		</header>
	);
}
