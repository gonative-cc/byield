import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Wallet } from "./Wallet/Wallet";
import { SuiWallet } from "./Wallet/SuiWallet";

enum APP_THEME_MODE {
	LIGHT = "light",
	DARK = "dark",
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
					<Wallet />
					<SuiWallet />
					<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
						{theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
					</Button>
				</div>
			</nav>
		</header>
	);
}
