import { useContext } from "react";
import { Link, useLocation } from "react-router";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { classNames } from "~/util/tailwind";
import { isProductionMode } from "~/lib/appenv";

function navMenuItems() {
	const isProd = isProductionMode();
	if (isProd) {
		return [
			{
				icon: "/assets/navigation/nBTC.svg",
				id: "navigation-2",
				title: "Buy nBTC",
				link: "",
				subNavItems: [
					{
						id: "navigation-2-1",
						link: "/",
						title: "Buy or Sell nBTC",
					},
				],
			},
		];
	}

	return [
		{
			icon: "/assets/navigation/nBTC.svg",
			id: "navigation-2",
			title: "Buy nBTC",
			link: "",
			subNavItems: [
				{
					id: "navigation-2-1",
					link: "/",
					title: "Buy or Sell nBTC",
				},
				{
					id: "navigation-2-2",
					link: "/mint",
					title: "Mint nBTC",
				},
			],
		},
		{
			icon: "/assets/navigation/nBTC.svg",
			id: "navigation-3",
			title: "Market",
			link: "/market",
			subNavItems: [],
		},
	];
}

export const Sidebar = () => {
	const location = useLocation();
	const currentPath = location.pathname;

	const { isCollapsed, isMobileOpen, toggleMobileMenu } = useContext(SideBarContext);
	const navItems = navMenuItems();

	return (
		<div className="flex">
			{/* Sidebar */}
			<div
				className={classNames({
					"md:translate-x-0 fixed md:static top-0 border-r-[1px] left-0 h-full text-white transition-all duration-300 ease-in-out z-50 bg-slate-950 md:bg-background":
						true,
					"translate-x-0 mt-6 md:mt-0": isMobileOpen,
					"-translate-x-full": !isMobileOpen,
					"w-16": isCollapsed,
					"w-60": !isCollapsed,
				})}
			>
				{/* Sidebar Content */}
				<div className="flex flex-col h-full">
					{/* Logo/Title */}
					<div className="p-4 flex items-center">
						{!isCollapsed && (
							<Link to="/" className="font-bold text-lg">
								<div className="md:w-32">
									<img
										src="/assets/app-logos/logo.svg"
										alt="Remix"
										className="hidden md:block"
									/>
								</div>
							</Link>
						)}
						{isCollapsed && (
							<Link to="/" className="font-bold text-lg">
								<div className="md:w-32">
									<img src="/assets/app-logos/logo-mobile.svg" alt="Remix" />
								</div>
							</Link>
						)}
					</div>

					{/* Navigation Items */}
					<nav className="flex-1 p-4">
						{navItems.map((item) => (
							<div key={item.id}>
								{/* Parent Nav Item */}
								<Link to={item.subNavItems.length ? {} : item.link}>
									<button
										type="button"
										className={classNames({
											"flex items-center w-full px-2 py-1 gap-2 rounded cursor-pointer mb-2":
												true,
											"bg-primary": currentPath === item.link,
											"hover:bg-accent": currentPath !== item.link,
										})}
									>
										<img src={item.icon} alt="" className="flex h-8 w-8 object-fit" />
										{!isCollapsed && (
											<div className="flex w-full justify-between">
												<span className="text-sm">{item.title}</span>
											</div>
										)}
									</button>
								</Link>

								{/* Submenu Items */}
								{!isCollapsed && item.subNavItems.length > 0 && (
									<div className="pl-10 ml-4 border-l-2">
										{item.subNavItems.map((subItem) => (
											<Link
												key={subItem.id}
												to={subItem.link}
												className={classNames({
													"flex items-center p-2 hover:bg-accent rounded cursor-pointer mb-2 text-sm":
														true,
													"bg-primary": currentPath === subItem.link,
													"hover:bg-accent": currentPath !== subItem.link,
												})}
											>
												<span>{subItem.title}</span>
											</Link>
										))}
									</div>
								)}
							</div>
						))}
					</nav>
				</div>
			</div>

			{/* Overlay for mobile */}
			{isMobileOpen && (
				<button
					type="button"
					className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
					onClick={toggleMobileMenu}
				/>
			)}
		</div>
	);
};
