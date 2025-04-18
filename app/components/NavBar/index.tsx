import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

enum APP_THEME_MODE {
	LIGHT = "light",
	DARK = "dark",
}

export const Navbar = () => {
	const [theme, setTheme] = useState<APP_THEME_MODE>(APP_THEME_MODE.LIGHT);

	const toggleTheme = () => {
		setTheme(theme === APP_THEME_MODE.LIGHT ? APP_THEME_MODE.DARK : APP_THEME_MODE.LIGHT);
		document.documentElement.classList.toggle(APP_THEME_MODE.DARK);
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav className="container mx-auto flex h-14 items-center">
				<Link to="/" className="font-bold text-lg">
					<div className="w-32">
						<img src="/logo-light.svg" alt="Remix" className="block w-full dark:hidden" />
						<img src="/logo-dark.svg" alt="Remix" className="hidden w-full dark:block" />
					</div>
				</Link>
				<div className="flex flex-1 items-center justify-end gap-4">
					<Button>Connect Wallet</Button>
					<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
						{theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
					</Button>
				</div>
			</nav>
		</header>
	);
};
