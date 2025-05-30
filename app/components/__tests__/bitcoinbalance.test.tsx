import { render, screen } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";
import { describe, it, expect } from "vitest";
import { BitcoinBalance } from "../BitcoinBalance";

describe("Bitcoin balance tests:", () => {
	it("should render bitcoin balance", async () => {
		const RemixStub = createRemixStub([
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
