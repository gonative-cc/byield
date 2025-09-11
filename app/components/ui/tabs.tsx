import { useState } from "react";
import { Tabs as DaisyUITabs } from "react-daisyui";
import { classNames } from "~/util/tailwind";

interface TabList {
	value: string;
	label: string;
	content: React.ReactNode;
}

interface TabsProps {
	tabs: TabList[];
}

export function Tabs({ tabs }: TabsProps) {
	const [activeTab, setActiveTab] = useState(tabs[0]?.value || "");

	return (
		<>
			<DaisyUITabs>
				{tabs.map(({ value, label }) => (
					<DaisyUITabs.RadioTab
						key={value}
						name="tabs"
						label={label}
						active={activeTab === value}
						onChange={() => setActiveTab(value)}
						className={classNames({
							"rounded-full bg-primary": activeTab === value,
						})}
					/>
				))}
			</DaisyUITabs>
			{tabs.find((tab) => tab.value === activeTab)?.content}
		</>
	);
}
