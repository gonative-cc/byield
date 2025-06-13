import { WalletContext } from "~/providers/ByieldWalletProvider";
import { isProductionMode } from "./appenv";
import { useContext } from "react";

export type eventParam = {
	label: string;
	category: GA_CATEGORY;
	[key: string]: string | number;
};

export enum GA_EVENT_NAME {
	BUY_NBTC = "TESTNET_BUY_NBTC",
}

export enum GA_CATEGORY {
	BUY_NBTC_SUCCESS = "SUCCESS",
	BUY_NBTC_ERROR = "ERROR",
}

export function useGoogleAnalytics() {
	const { network } = useContext(WalletContext);

	function trackEvent(eventName: GA_EVENT_NAME, params: eventParam) {
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", eventName, { ...params, network, prod: isProductionMode() });
		}
	}
	return { trackEvent };
}
