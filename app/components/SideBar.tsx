import { useContext, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { SideBarContext } from "~/providers/SiderBarProvider";
import { classNames } from "~/util/tailwind";
import { isProductionMode } from "~/lib/appenv";

interface MenuItem {
	icon: string;
	id: string;
	title: string;
	link: string;
	subNavItems: MenuItem[];
}

interface MenuSubItem {
	id: string;
	link: string;
	title: string;
}

function navMenuItems(): MenuItem[] {
	const isProd = isProductionMode();
	if (isProd) {
		return [
			{
				icon: "/assets/navigation/nBTC.svg",
				id: "navigation-1",
				title: "nBTC (testnet)",
				link: "",
				subNavItems: [
					{
						id: "navigation-2-1",
						icon: "",
						subNavItems: [],
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
			title: "nBTC (testnet)",
			link: "",
			subNavItems: [
				{
					id: "navigation-2-1",
					link: "/",
					icon: "",
						subNavItems: [],
					title: "Buy or Sell nBTC",
				},
				{
					id: "navigation-2-2",
					link: "/mint",
					icon: "",
						subNavItems: [],
					title: "Mint nBTC",
				},
			],
		},
		{
			icon: "/assets/navigation/byield.svg",
			id: "navigation-3",
			title: "Market (testnet)",
			link: "/market",
			subNavItems: [],
		},
		{
			icon: "/assets/navigation/bee-with-bitcoin.svg",
			id: "navigation-4",
			title: "Beelievers Auction (mainnet)",
			link: "/beelievers-auction",
			subNavItems: [],
		},
	];
}

export function ByieldSideBar() {
	const location = useLocation();
	const currentPath = location.pathname;
	const sidebarRef = useRef<HTMLDivElement>(null);

	const { isCollapsed, isMobileOpen, toggleMobileMenu } = useContext(SideBarContext);
	const navItems = navMenuItems();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
				toggleMobileMenu();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isMobileOpen, toggleMobileMenu]);

	return (
		<div className="flex">
			{/* Sidebar */}
			<div
				ref={sidebarRef}
				className={classNames({
					"md:translate-x-0 fixed md:static top-0 border-r left-0 h-full text-white transition-all duration-300 ease-in-out z-50 bg-slate-950 md:bg-background":
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
										alt="Native"
										className="hidden md:block"
									/>
								</div>
							</Link>
						)}
						{isCollapsed && (
							<Link to="/" className="font-bold text-lg">
								<div className="md:w-32">
									<img src="/assets/app-logos/logo-mobile.svg" alt="Native" />
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
}

const itemCls = "flex items-center px-2 py-1 rounded mb-2";

function ParentItem(item: MenuItem, currentPath: string, collapsed: boolean) {
	const component = (
		<div
			className={classNames(itemCls, {
				"bg-primary": currentPath === item.link,
				"hover:bg-accent": currentPath !== item.link,
				"cursor-default": item.link === "",
			})}
		>
			<img src={item.icon} alt="" className="flex h-8 w-8 object-fit" />
			{!collapsed && (
				<div className="flex w-full justify-between">
					<span className="text-sm">{item.title}</span>
				</div>
			)}
		</div>
	);
	if (!item.link) return component;

	return <Link to={item.link}>{component}</Link>;
}

function SubItems(subItems: MenuSubItem[], currentPath: string) {
	if (!subItems.length) return "";

	return (
		<div className="pl-10 ml-4 border-l-2">
			{subItems.map((subItem) => (
				<Link
					key={subItem.id}
					to={subItem.link}
					className={classNames(itemCls, "text-sm", {
						"bg-primary": currentPath === subItem.link,
						"hover:bg-accent": currentPath !== subItem.link,
					})}
				>
					<span>{subItem.title}</span>
				</Link>
			))}
		</div>
	);
}
