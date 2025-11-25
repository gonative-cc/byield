import { ControlledHiveTabs } from "./ControlledHiveTabs";

export function HivePage() {
	return (
		<div className="flex w-full flex-col items-center gap-8 px-2 pt-2 md:px-30">
			<ControlledHiveTabs />
		</div>
	);
}
