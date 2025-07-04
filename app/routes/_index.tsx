import type { MetaFunction } from "react-router";
import { BuyNBTC } from "~/pages/BuyNBTC";

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
