import { isProductionMode } from "~/lib/appenv";
import { SelectWallet } from "./SelectWallet";
import { Menu } from "lucide-react";
import { useContext } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";

export function NavBar() {
	const isProd = isProductionMode();
	const { toggleMobileMenu } = useContext(SideBarContext);

	return (
		<header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-14 w-full items-center justify-end border-b px-1 backdrop-blur-sm md:pr-10">
			<div className="flex w-full md:hidden">
				<button className="mr-2 focus:outline-hidden md:hidden" onClick={toggleMobileMenu}>
					<Menu className="h-6 w-6" />
				</button>
				<img src="/assets/app-logos/logo-mobile.svg" alt="Remix" className="md:hidden" />
			</div>
			<div className="flex items-center gap-4">
				<SelectWallet isProductionMode={isProd} />
			</div>
		</header>
	);
}
