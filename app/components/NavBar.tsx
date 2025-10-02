import { isProductionMode } from "~/lib/appenv";
import { SelectWallet } from "./SelectWallet";
import { Menu } from "lucide-react";
import { useContext } from "react";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { BeelieversBadge } from "./BeelieversBadge";

export function NavBar() {
	const isProd = isProductionMode();
	const { toggleMobileMenu } = useContext(SideBarContext);

	return (
		<header className="flex w-full h-14 items-center px-1 md:pr-10 sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 justify-end">
			<div className="flex w-full md:hidden">
				<button className="md:hidden focus:outline-hidden mr-2" onClick={toggleMobileMenu}>
					<Menu className="h-6 w-6" />
				</button>
				<img src="/assets/app-logos/logo-mobile.svg" alt="Remix" className="md:hidden" />
			</div>
			<div className="flex items-center gap-4">
				<BeelieversBadge />
				<SelectWallet isProductionMode={isProd} />
			</div>
		</header>
	);
}
