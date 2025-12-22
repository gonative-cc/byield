import { useState } from "react";
import { Home } from "./Home";
import type { TabType } from "./types";
import { HiveFAQ } from "./HiveFAQ";
import { Dashboard } from "./Dashboard";
import { useLocation } from "react-router";

export const ControlledHiveTabs = () => {
	const location = useLocation();
	const pathnameHash = location.hash;

	const [activeTab, setActiveTab] = useState<TabType>(() => {
		if (pathnameHash) {
			return "faq";
		}
		return "home";
	});

	const redirectTab = (tab: TabType) => {
		setActiveTab(tab);
	};

	const renderTabButton = (newTab: TabType) => {
		return (
			<button
				onClick={() => setActiveTab(newTab)}
				className={`tab font-medium capitalize ${activeTab === newTab ? "bg-primary text-primary-content rounded-full" : ""}`}
			>
				{newTab === "faq" ? "FAQ & Transparency" : newTab}
			</button>
		);
	};

	return (
		<div className="w-full">
			<div className="mb-12 flex justify-center">
				<div className="tabs tabs-boxed bg-base-200 rounded-full shadow-lg">
					{renderTabButton("home")}
					{renderTabButton("dashboard")}
					{renderTabButton("faq")}
				</div>
			</div>

			{activeTab === "home" && <Home redirectTab={redirectTab} />}
			{activeTab === "dashboard" && <Dashboard redirectTab={redirectTab} />}
			{activeTab === "faq" && <HiveFAQ />}
		</div>
	);
};
