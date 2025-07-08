import { ReactNode, createContext, useState } from "react";

interface SideBarContextI {
	isCollapsed: boolean;
	isMobileOpen: boolean;
	handleSideBarCollapse: () => void;
	toggleMobileMenu: () => void;
}

export const SideBarContext = createContext<SideBarContextI>({
	isCollapsed: false,
	isMobileOpen: false,
	handleSideBarCollapse: () => {},
	toggleMobileMenu: () => {},
});

export const SideBarProvider = ({ children }: { children: ReactNode }) => {
	const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
	const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

	const handleSideBarCollapse = () => setIsCollapsed((prevState) => !prevState);
	const toggleMobileMenu = () => setIsMobileOpen((prevState) => !prevState);

	return (
		<SideBarContext.Provider
			value={{
				isCollapsed,
				isMobileOpen,
				handleSideBarCollapse,
				toggleMobileMenu,
			}}
		>
			{children}
		</SideBarContext.Provider>
	);
};
