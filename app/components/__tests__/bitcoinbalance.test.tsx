import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, it, expect } from "vitest";
import { BitcoinBalance } from "../BitcoinBalance";

// TODO: maybe we can find other solution. Probably vitets.setup.ts is not imported by tsc
//  https://vitest.dev/guide/browser/assertion-api
// Workaround is to import: to solve  Property 'toBeInTheDocument' does not exist on type 'Assertion<HTMLElement>'.
import "@testing-library/jest-dom";

describe("Bitcoin balance tests:", () => {
	it("should render bitcoin balance", async () => {
		const RemixStub = createRoutesStub([
			{
				path: "/",
				Component: () => <BitcoinBalance availableBalance={"20"} />,
			},
		]);

		render(<RemixStub />);

		expect(await screen.findByText("Available Balance")).toBeInTheDocument();
		expect(await screen.findByText("20 BTC")).toBeInTheDocument();
	});
});
