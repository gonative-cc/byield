import { useState } from "react";
import { MintBTC } from "./MintBTC";
import { RedeemBTC } from "./RedeemBTC";

type TabType = "mint" | "redeem";

interface ControlledNBTCTabsProps {
	fetchMintTxs: () => void;
	fetchRedeemTxs: () => void;
	onTabChange?: (tab: TabType) => void;
}

export const ControlledNBTCTabs = ({
	fetchMintTxs,
	fetchRedeemTxs,
	onTabChange,
}: ControlledNBTCTabsProps) => {
	const [activeTab, setActiveTab] = useState<TabType>("mint");

	const handleTabChange = (newTab: TabType) => {
		setActiveTab(newTab);
		onTabChange?.(newTab);
	};

	const renderTabButton = (newTab: TabType) => {
		return (
			<button
				onClick={() => handleTabChange(newTab)}
				className={`tab font-medium capitalize ${activeTab === newTab ? "bg-primary text-primary-content rounded-full" : ""}`}
			>
				{newTab}
			</button>
		);
	};

	return (
		<div className="w-full">
			<div className="mb-8 flex justify-center">
				<div className="tabs tabs-boxed bg-base-200 rounded-full shadow-lg">
					{renderTabButton("mint")}
					{renderTabButton("redeem")}
				</div>
			</div>

			{activeTab === "mint" && <MintBTC fetchMintTxs={fetchMintTxs} />}
			{activeTab === "redeem" && <RedeemBTC fetchRedeemTxs={fetchRedeemTxs} />}
		</div>
	);
};

export type { TabType };
