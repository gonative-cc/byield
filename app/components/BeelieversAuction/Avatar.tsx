import { Button } from "../ui/button";

const AVATARS = [
	{
		key: "smith",
		src: "/assets/avatar/smith.svg",
	},
	{
		key: "alice",
		src: "/assets/avatar/alice.svg",
	},
	{
		key: "bruce",
		src: "/assets/avatar/bruce.svg",
	},
	{
		key: "julie",
		src: "/assets/avatar/julie.svg",
	},
];

export function Avatar() {
	return (
		<div className="flex flex-col gap-2 items-center">
			<div className="flex flex-col md:flex-row gap-4 items-center">
				<div className="flex -space-x-4 rtl:space-x-reverse">
					{AVATARS.map(({ key, src }) => (
						<img
							key={key}
							alt={key}
							src={src}
							className="w-10 h-10 rounded-full dark:border-gray-800"
						/>
					))}
				</div>
				<span>1349 whitelisted people put their bid for the auction</span>
			</div>
			<p className="text-gray-400">
				<Button variant="link" className="p-0 underline text-white">
					Connect Wallet
				</Button>{" "}
				to check your eligibility
			</p>
		</div>
	);
}
