import type { MetaFunction } from "react-router";
import { SuiGQLTester } from "~/components/Sui-GQL-tester";

export const meta: MetaFunction = () => {
	return [{ title: "GraphQL Tester - BYIELD" }];
};

export default function GraphQLTest() {
	return (
		<div className="flex w-full justify-center p-4">
			<div className="w-full max-w-4xl">
				<SuiGQLTester />
			</div>
		</div>
	);
}
