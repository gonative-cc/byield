import { useState } from "react";
import { Home } from "./Home";
import type { TabType } from "./types";
import { HiveFAQ } from "./HiveFAQ";
import { Dashboard } from "./Dashboard";

export const ControlledHiveTabs = () => {
	const [activeTab, setActiveTab] = useState<TabType>("Home");

	const redirectTab = (redirectTab: TabType) => {
		setActiveTab(() => redirectTab);
	};

	const renderTabButton = (newTab: TabType) => {
		return (
			<button
				onClick={() => setActiveTab(newTab)}
				className={`tab font-medium ${activeTab === newTab ? "bg-primary text-primary-content rounded-full" : ""}`}
			>
				{newTab}
			</button>
		);
	};

	return (
		<div className="w-full">
			<div className="mb-12 flex justify-center">
				<div className="tabs tabs-boxed bg-base-200 rounded-full shadow-lg">
					{renderTabButton("Home")}
					{renderTabButton("Dashboard")}
					{renderTabButton("Faq")}
				</div>
			</div>

			{activeTab === "Home" && <Home redirectTab={redirectTab} />}
			{activeTab === "Dashboard" && <Dashboard />}
			{activeTab === "Faq" && <HiveFAQ />}
		</div>
	);
};
