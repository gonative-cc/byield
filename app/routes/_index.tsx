import type { MetaFunction } from "@remix-run/cloudflare";
import { MintNBTC } from "~/components/MintNBTC";

export const meta: MetaFunction = () => {
	return [{ title: "BYIELD App" }, { name: "description", content: "Welcome to BYIELD App!" }];
};

export default function Index() {
	return (
		<div className="flex justify-center w-full">
			<MintNBTC availableBalance={0} suiAddress={""} />
		</div>
	);
}
