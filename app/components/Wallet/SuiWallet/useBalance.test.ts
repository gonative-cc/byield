import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BalanceChange, ObjectOwner } from "@mysten/sui/client";

import { handleBalanceChanges } from "./useBalance";

describe("handleBalanceChanges", () => {
	// Mock function to track updates
	let mockUpdateCoinBalanceInCache: (newBalance: string) => void;
	let updateCalls: string[];

	const owner: ObjectOwner = { AddressOwner: "" };
	const coinType = "0x1::sui::SUI";

	beforeEach(() => {
		updateCalls = [];
		mockUpdateCoinBalanceInCache = vi.fn((newBalance: string) => {
			updateCalls.push(newBalance);
		});
	});

	it("should update balance when there is a single balance change", () => {
		const balanceChanges: BalanceChange[] = [{ coinType, amount: "1000", owner }];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		expect(mockUpdateCoinBalanceInCache).toHaveBeenCalledWith("6000");
		expect(updateCalls).toEqual(["6000"]);
	});

	it("should aggregate multiple balance changes for the same coin type", () => {
		const balanceChanges: BalanceChange[] = [
			{ coinType, amount: "1000", owner },
			{ coinType, amount: "2000", owner },
		];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		// Total change should be 1000 + 2000 = 3000
		expect(mockUpdateCoinBalanceInCache).toHaveBeenCalledWith("8000");
		expect(updateCalls).toEqual(["8000"]);
	});

	it("should handle negative balance changes (decreases)", () => {
		const balanceChanges: BalanceChange[] = [{ coinType, amount: "-1000", owner }];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		expect(mockUpdateCoinBalanceInCache).toHaveBeenCalledWith("4000");
		expect(updateCalls).toEqual(["4000"]);
	});

	it("should handle mixed positive and negative balance changes for same coin", () => {
		const balanceChanges: BalanceChange[] = [
			{ coinType, amount: "2000", owner },
			{ coinType, amount: "-500", owner },
			{ coinType, amount: "1000", owner },
		];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		// Total change should be 2000 + (-500) + 1000 = 2500
		expect(mockUpdateCoinBalanceInCache).toHaveBeenCalledWith("7500");
		expect(updateCalls).toEqual(["7500"]);
	});

	it("should not update balance when total change is zero", () => {
		const balanceChanges: BalanceChange[] = [
			{ coinType, amount: "1000", owner },
			{ coinType, amount: "-1000", owner },
		];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		expect(mockUpdateCoinBalanceInCache).not.toHaveBeenCalled();
		expect(updateCalls).toEqual([]);
	});

	it("should only update cached coins that match the balance change coin type", () => {
		const balanceChanges: BalanceChange[] = [
			{ coinType: "0x2::coin::COIN1", amount: "1000", owner },
		];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
			{
				coinType: "0x2::coin::COIN1",
				currentBalance: BigInt("3000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		expect(mockUpdateCoinBalanceInCache).toHaveBeenCalledTimes(1);
		expect(mockUpdateCoinBalanceInCache).toHaveBeenCalledWith("4000");
		expect(updateCalls).toEqual(["4000"]);
	});

	it("should handle multiple different coin types with changes", () => {
		const balanceChanges: BalanceChange[] = [
			{ coinType: "0x1::sui::SUI", amount: "1000", owner },
			{ coinType: "0x2::coin::COIN1", amount: "2000", owner },
			{ coinType: "0x1::sui::SUI", amount: "500", owner },
		];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
			{
				coinType: "0x2::coin::COIN1",
				currentBalance: BigInt("3000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		// First call should be for SUI: 5000 + 1000 + 500 = 6500
		// Second call should be for COIN1: 3000 + 2000 = 5000
		expect(mockUpdateCoinBalanceInCache).toHaveBeenCalledTimes(2);
		expect(updateCalls).toContain("6500");
		expect(updateCalls).toContain("5000");
	});

	it("should not update if no matching cached coin is found for balance change", () => {
		const balanceChanges: BalanceChange[] = [
			{ coinType: "0x3::coin::NOT_CACHED", amount: "1000", owner },
		];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		expect(mockUpdateCoinBalanceInCache).not.toHaveBeenCalled();
		expect(updateCalls).toEqual([]);
	});

	it("should handle zero amount changes", () => {
		const balanceChanges: BalanceChange[] = [{ coinType, amount: "0", owner }];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		expect(mockUpdateCoinBalanceInCache).not.toHaveBeenCalled();
		expect(updateCalls).toEqual([]);
	});

	it("should handle large BigInt values correctly", () => {
		const largeAmount = BigInt("1000000000000000000");
		const balanceChanges: BalanceChange[] = [
			{ coinType, amount: largeAmount.toString(), owner },
		];

		const cached = [
			{
				coinType: "0x1::sui::SUI",
				currentBalance: BigInt("5000"),
				updateCoinBalanceInCache: mockUpdateCoinBalanceInCache,
			},
		];

		handleBalanceChanges(balanceChanges, cached);

		expect(mockUpdateCoinBalanceInCache).toHaveBeenCalledWith(
			(largeAmount + BigInt(5000)).toString(),
		);
	});
});
