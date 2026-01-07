import type { RedeemRequestEventRaw } from "external/workers/packages/sui-indexer/src/models";
import { MintBTC } from "./MintBTC";
import { RedeemBTC } from "./RedeemBTC";

export type TabType = "mint" | "redeem";

interface ControlledNBTCTabsProps {
	fetchMintTxs: () => void;
	fetchRedeemTxs: () => void;
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
	handleRedeemBTCSuccess: (txId: string, e: RedeemRequestEventRaw) => Promise<void>;
}

export const ControlledNBTCTabs = ({
	fetchMintTxs,
	fetchRedeemTxs,
	activeTab,
	onTabChange,
	handleRedeemBTCSuccess,
}: ControlledNBTCTabsProps) => {
	const handleTabChange = (newTab: TabType) => {
		onTabChange(newTab);
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
				<div className="tabs tabs-box bg-base-200 rounded-full shadow-lg">
					{renderTabButton("mint")}
					{renderTabButton("redeem")}
				</div>
			</div>

			{activeTab === "mint" && <MintBTC fetchMintTxs={fetchMintTxs} />}
			{activeTab === "redeem" && (
				<RedeemBTC fetchRedeemTxs={fetchRedeemTxs} handleRedeemBTCSuccess={handleRedeemBTCSuccess} />
			)}
		</div>
	);
};
