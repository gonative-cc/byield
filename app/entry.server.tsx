import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { logError } from "~/lib/log";
import { SANCTIONED_COUNTRY_REGION } from "~/config/sanctions";

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
	_loadContext: AppLoadContext,
) {
	let shellRendered = false;
	const userAgent = request.headers.get("user-agent");

	const ipCountryCode = request.headers.get("cf-ipcountry");
	const ipRegion = request.headers.get("cf-region");
	const isCountrySanctioned = ipCountryCode && SANCTIONED_COUNTRY_REGION.country.includes(ipCountryCode);
	const isRegionSanctioned = ipRegion && SANCTIONED_COUNTRY_REGION.regions.includes(ipRegion);

	if (isCountrySanctioned || isRegionSanctioned) {
		return new Response("Access denied: location restricted", {
			status: 403,
			headers: responseHeaders,
		});
	}

	const body = await renderToReadableStream(<ServerRouter context={routerContext} url={request.url} />, {
		onError(error: unknown) {
			responseStatusCode = 500;
			// Log streaming rendering errors from inside the shell.  Don't log
			// errors encountered during initial shell rendering since they'll
			// reject and get logged in handleDocumentRequest.
			if (shellRendered) {
				logError({ msg: "Server render error", method: "handleRequest" }, error);
			}
		},
	});
	shellRendered = true;

	// Ensure requests from bots and SPA Mode renders wait for all content to load before responding
	// https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
	if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
		await body.allReady;
	}

	responseHeaders.set("Content-Type", "text/html");
	return new Response(body, {
		headers: responseHeaders,
		status: responseStatusCode,
	});
}
