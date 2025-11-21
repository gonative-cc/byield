// Requires Bot Management Enterprise add-on enabled in Cloudflare dashboard.
// Once enabled, Cloudflare automatically populates request.cf.botManagement with bot scores and flags.
export function checkBotProtection(request: Request, blockBots = false) {
	const ip =
		request.headers.get("CF-Connecting-IP") ||
		request.headers.get("X-Forwarded-For") ||
		"unknown";

	const botMgmt = (
		request as {
			cf?: {
				botManagement?: { score: number; verifiedBot: boolean; staticResource: boolean };
			};
		}
	).cf?.botManagement;
	if (!botMgmt) {
		return {
			allowed: true,
			isBot: false,
			ip,
		};
	}

	if (botMgmt.verifiedBot || botMgmt.staticResource) {
		return {
			allowed: true,
			isBot: false,
			ip,
		};
	}

	const botScore = botMgmt.score;
	const isBot = botScore < 30;

	if (isBot && blockBots) {
		return {
			allowed: false,
			reason: "Bot traffic not allowed",
			isBot: true,
			ip,
		};
	}

	return {
		allowed: true,
		isBot,
		ip,
	};
}
