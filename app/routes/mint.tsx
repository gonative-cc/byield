import { MintBTC } from "~/components/MintNBTC";

export default function Mint() {
	return (
		<div className="flex justify-center">
			<MintBTC availableBalance={0} suiAddress={""} />
		</div>
	);
}
