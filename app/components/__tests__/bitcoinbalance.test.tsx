import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { BitcoinBalance } from "../BitcoinBalance";

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
