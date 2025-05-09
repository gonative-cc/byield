import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { XverseWallet } from "./Wallet/XverseWallet/XverseWallet";
import { SuiWallet } from "./Wallet/SuiWallet/SuiWallet";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { useXverseConnect } from "./Wallet/XverseWallet/useWallet";
import { SuiModal } from "./Wallet/SuiWallet/SuiModal";

enum APP_THEME_MODE {
	LIGHT = "light",
	DARK = "dark",
}

function SelectWallet() {
	const { connectWallet } = useXverseConnect();
	const { connectedWallet } = useContext(WalletContext);

	// none of the wallet is connected, than show connect button for all available wallets
	if (!connectedWallet) {
		return (
			<>
				{/* Xverse wallet connect button */}
				<Button onClick={connectWallet}>Connect Bitcoin Wallet</Button>
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
							src="/assets/app-logos/logo-light.svg"
							alt="Remix"
							className="block w-full dark:hidden"
						/>
						<img
							src="/assets/app-logos/logo-dark.svg"
							alt="Remix"
							className="hidden w-full dark:block"
						/>
					</div>
				</Link>
				<div className="flex flex-1 items-center justify-end gap-4">
					<SelectWallet />
					<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
						{theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
					</Button>
				</div>
			</nav>
		</header>
	);
}
