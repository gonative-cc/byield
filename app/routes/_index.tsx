import type { MetaFunction } from "@remix-run/cloudflare";
import { MintBTC } from "~/components/MintBTC";

export const meta: MetaFunction = () => {
	return [{ title: "BYIELD App" }, { name: "description", content: "Welcome to BYIELD App!" }];
};

export default function Index() {
	return (
		<div className="flex justify-center">
			<MintBTC availableBalance={0} suiAddress={""} />
		</div>
	);
}
