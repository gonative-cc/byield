import { RouteConfig } from "@react-router/dev/routes";
import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";

export default remixRoutesOptionAdapter((defineRoutes) => {
	return defineRoutes((route) => {
		route("/", "routes/_index.tsx", { index: true });
		route("/market", "routes/market.tsx");
		route("/mint", "routes/mint.tsx");
		route("/beelievers-auction", "routes/beelievers-auction.tsx");
		// Add 404 catch-all route
		route("*", "routes/404.tsx");
	});
}) satisfies RouteConfig;
