import type { MetaFunction } from "@remix-run/cloudflare";
import { BuyNBTC } from "~/components/BuyNBTC/BuyNBTC";

export const meta: MetaFunction = () => {
	return [{ title: "BYIELD App" }, { name: "description", content: "Welcome to BYIELD App!" }];
};

export default function Index() {
	return (
		<div className="flex justify-center w-full">
			<BuyNBTC />
		</div>
	);
}
