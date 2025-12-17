import { describe, it, expect, vi } from "vitest";
import { getUserDeposits } from "./lockdrop-transactions";
import type { LockdropCfg } from "~/config/sui/contracts-config";
import type { SuiClient } from "@mysten/sui/client";

// Mock SuiClient
const mockSuiClient = {
	devInspectTransactionBlock: vi.fn(),
};

const mockLockdropCfg: LockdropCfg = {
	pkgId: "0xtest123",
	lockdropId: "0xlockdrop456",
	module: "lockdrop",
};

describe("getUserDeposits", () => {
	it("should return null when transaction fails", async () => {
		mockSuiClient.devInspectTransactionBlock.mockResolvedValue({
			effects: { status: { status: "failure", error: "Transaction failed" } },
		});

		const result = await getUserDeposits(
			"0xuser123",
			mockLockdropCfg,
			mockSuiClient as unknown as SuiClient,
		);

		expect(result).toEqual(null);
	});

	it("should return null when no return values", async () => {
		mockSuiClient.devInspectTransactionBlock.mockResolvedValue({
			effects: { status: { status: "success" } },
			results: [{ returnValues: [] }],
		});

		const result = await getUserDeposits(
			"0xuser123",
			mockLockdropCfg,
			mockSuiClient as unknown as SuiClient,
		);

		expect(result).toEqual(null);
	});

	it("should return null when client throws error", async () => {
		mockSuiClient.devInspectTransactionBlock.mockRejectedValue(new Error("Network error"));

		const result = await getUserDeposits(
			"0xuser123",
			mockLockdropCfg,
			mockSuiClient as unknown as SuiClient,
		);

		expect(result).toEqual(null);
	});

	it("should return null when no results", async () => {
		mockSuiClient.devInspectTransactionBlock.mockResolvedValue({
			effects: { status: { status: "success" } },
			results: [],
		});

		const result = await getUserDeposits(
			"0xuser123",
			mockLockdropCfg,
			mockSuiClient as unknown as SuiClient,
		);

		expect(result).toEqual(null);
	});
});
