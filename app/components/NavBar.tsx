import { Link } from "react-router";
import { NavMenu, NavMenuItem } from "./ui/navigation-menu";
import { isProductionMode } from "~/lib/appenv";
import { SelectWallet } from "./SelectWallet";

function navMenuItems(isProduction: boolean): NavMenuItem[] {
	if (isProduction) {
		return [];
	}
	return [
		{
			id: "navigation-1",
			title: "Buy nBTC",
			link: "/",
		},
		{
			id: "navigation-2",
			title: "Market",
			link: "/market",
		},
		{
			id: "navigation-3",
			title: "Mint nBTC",
			link: "/mint",
		},
	];
}

export function NavBar() {
	const isProd = isProductionMode();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav className="container md:mx-auto flex h-14 items-center px-4">
				<Link to="/" className="font-bold text-lg">
					<div className="md:w-32">
						<img src="/assets/app-logos/logo.svg" alt="Remix" className="hidden md:block" />
						<img src="/assets/app-logos/logo-mobile.svg" alt="Remix" className="block md:hidden" />
					</div>
				</Link>
				<div className="flex flex-1 justify-center">
					<NavMenu items={navMenuItems(isProd)} />
				</div>
				<div className="flex flex-1 items-center justify-end gap-4">
					<SelectWallet isProductionMode={isProd} />
				</div>
			</nav>
		</header>
	);
}
