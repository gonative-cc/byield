import { GA_EVENT_NAME, eventParam } from "~/types/googleAnalytics";

export function trackEvent(eventName: GA_EVENT_NAME, params: eventParam) {
	if (typeof window !== "undefined" && window.gtag) {
		window.gtag("event", eventName, { ...params });
	}
}
