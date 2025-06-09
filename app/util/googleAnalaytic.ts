import { BYIELD_GA_EVENT_NAME, eventParam } from "~/types/googleAnalytics";

export function trackEvent(eventName: BYIELD_GA_EVENT_NAME, params: eventParam) {
	if (typeof window !== "undefined" && window.gtag) {
		window.gtag("event", eventName, { ...params });
	}
}
