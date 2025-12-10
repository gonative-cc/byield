import { useContext, useRef, useEffect } from "react";
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
					/*
					disabling buy or sell of nbtc and will be enabled later
					// {
					// 	id: "navigation-2-1",
					// 	icon: "",
					// 	subNavItems: [],
					// 	link: "/",
					// 	title: "Buy or Sell nBTC",
					// },
					*/
					{
						id: "navigation-2-2",
						link: "/nbtc/mint",
						icon: "",
						subNavItems: [],
						title: "Mint nBTC",
					},
					{
						id: "navigation-2-3",
						link: "/reserve-dashboard",
						icon: "",
						subNavItems: [],
						title: "Reserves",
					},
				],
			},
			{
				icon: "/assets/navigation/bee-with-bitcoin.svg",
				id: "navigation-2",
				title: "Beelievers Auction (mainnet)",
				link: "/beelievers-auction",
				subNavItems: [],
			},
			// hiding the end point for now. Will be enabled when the hive program is live.
			// {
			// 	icon: "/assets/navigation/hive.svg",
			// 	id: "navigation-3",
			// 	title: "Hive",
			// 	link: "/hive",
			// 	subNavItems: [],
			// },
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
					link: "/nbtc/mint",
					icon: "",
					subNavItems: [],
					title: "Mint nBTC",
				},
				{
					id: "navigation-2-3",
					link: "/reserve-dashboard",
					icon: "",
					subNavItems: [],
					title: "Reserves",
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
		// hiding the end point for now. Will be enabled when the hive program is live.
		// {
		// 	icon: "/assets/navigation/hive.svg",
		// 	id: "navigation-5",
		// 	title: "Hive",
		// 	link: "/hive",
		// 	subNavItems: [],
		// },
	];
}

export function SideBar() {
	const location = useLocation();
	const currentPath = location.pathname;
	const sidebarRef = useRef<HTMLDivElement>(null);

	const { isCollapsed, isMobileOpen, toggleMobileMenu } = useContext(SideBarContext);
	const navItems = navMenuItems();

	useEffect(() => {
		// handle auto dismiss of sidebar in mobile view
		const handleClickOutside = (event: MouseEvent) => {
			if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
				toggleMobileMenu();
			}
		};

		if (isMobileOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isMobileOpen, toggleMobileMenu]);

	return (
		<div className="flex">
			{/* Sidebar */}
			<div
				ref={sidebarRef}
				className={classNames({
					"bg-base-100 fixed top-0 left-0 z-50 h-full border-r transition-all duration-300 ease-in-out md:static md:translate-x-0": true,
					"mt-6 translate-x-0 md:mt-0": isMobileOpen,
					"-translate-x-full": !isMobileOpen,
					"w-16": isCollapsed,
					"w-60": !isCollapsed,
				})}
			>
				{/* Sidebar Content */}
				<div className="flex h-full flex-col">
					{/* Logo/Title */}
					<div className="flex items-center p-4">
						{!isCollapsed && (
							<Link to="/" className="text-lg font-bold">
								<div className="md:w-32">
									<img
										src="/assets/app-logos/logo.svg"
										alt="Native"
										className="hidden md:inline"
									/>
								</div>
							</Link>
						)}
						{isCollapsed && (
							<Link to="/" className="text-lg font-bold">
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
								{ParentItem(item, currentPath, isCollapsed)}
								{!isCollapsed && SubItems(item.subNavItems, currentPath)}
							</div>
						))}
					</nav>
				</div>
			</div>

			{/* Overlay for mobile */}
			{isMobileOpen && (
				<button type="button" className="fixed inset-0 md:hidden" onClick={toggleMobileMenu} />
			)}
		</div>
	);
}

const itemCls = "flex items-center px-2 py-1 rounded mb-2 gap-1";

function ParentItem(item: MenuItem, currentPath: string, collapsed: boolean) {
	const component = (
		<div
			className={classNames(itemCls, {
				"bg-primary": currentPath === item.link,
				"hover:bg-neutral": currentPath !== item.link,
				"cursor-default": item.link === "",
			})}
		>
			<img src={item.icon} alt="" className="flex h-8 w-8" />
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
		<div className="ml-4 border-l-2 pl-10">
			{subItems.map((subItem) => (
				<Link
					key={subItem.id}
					to={subItem.link}
					className={classNames(itemCls, "text-sm", {
						"bg-primary": currentPath === subItem.link,
						"hover:bg-neutral": currentPath !== subItem.link,
					})}
				>
					<span>{subItem.title}</span>
				</Link>
			))}
		</div>
	);
}
