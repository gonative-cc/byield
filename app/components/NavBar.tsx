import { isProductionMode } from "~/lib/appenv";
import { SelectWallet } from "./SelectWallet";
import { Menu } from "lucide-react";
import { useContext } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";

export function NavBar() {
	const isProd = isProductionMode();
	const { toggleMobileMenu } = useContext(SideBarContext);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav className="container flex w-full h-14 items-center px-2 md:pr-10">
				<div className="flex w-full gap-1">
					<button className="md:hidden focus:outline-none mr-2" onClick={toggleMobileMenu}>
						<Menu className="h-6 w-6" />
					</button>
					<img src="/assets/app-logos/logo-mobile.svg" alt="Remix" className="block md:hidden" />
				</div>
				<div className="flex items-center gap-4">
					<SelectWallet isProductionMode={isProd} />
				</div>
			</nav>
		</header>
	);
}
