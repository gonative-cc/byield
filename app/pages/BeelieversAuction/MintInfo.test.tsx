import { test, expect } from "vitest";
import { formatSuiMintErr, formatSuiRefundErr } from "./MintInfo";

test("formatSuiErr", () => {
	let errMsg = `Error minting: TRPCClientError: Dry run failed, could not automatically determine a budget: MoveAbort(MoveLocation { module: ModuleId { address: 3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c, name: Identifier("mint") }, function: 27, instruction: 73, function_name: Some("mint") }, 4) in command 1`;
	let txErr = formatSuiMintErr(errMsg);
	expect(txErr).toBe('Tx aborted, function: Some("mint") reason: "user already minted"');

	errMsg = `Error minting: TRPCClientError: User rejected the request`;
	txErr = formatSuiMintErr(errMsg);
	expect(txErr).toEqual("User rejected the request");
});

test("formatSuiRefundErr", () => {
	// Test ENotFinalized (4) - auction not finalized yet
	let errMsg = `Error refunding: TRPCClientError: Dry run failed, could not automatically determine a budget: MoveAbort(MoveLocation { module: ModuleId { address: 3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c, name: Identifier("withdraw") }, function: 15, instruction: 42, function_name: Some("withdraw") }, 4) in command 1`;
	let txErr = formatSuiRefundErr(errMsg);
	expect(txErr).toBe('Tx aborted, function: Some("withdraw") reason: "auction not finalized yet"');

	// Test user rejection
	errMsg = `Error refunding: TRPCClientError: User rejected the request`;
	txErr = formatSuiRefundErr(errMsg);
	expect(txErr).toEqual("User rejected the request");

	// Test ENoBidFound (6) - no bid found for this address
	errMsg = `Error refunding: TRPCClientError: Dry run failed, could not automatically determine a budget: MoveAbort(MoveLocation { module: ModuleId { address: 3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c, name: Identifier("withdraw") }, function: 15, instruction: 42, function_name: Some("withdraw") }, 6) in command 1`;
	txErr = formatSuiRefundErr(errMsg);
	expect(txErr).toBe('Tx aborted, function: Some("withdraw") reason: "no bid found for this address"');

	// Test EInsufficientBidForWinner (14) - insufficient bid amount for winner
	errMsg = `Error refunding: TRPCClientError: Dry run failed, could not automatically determine a budget: MoveAbort(MoveLocation { module: ModuleId { address: 3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c, name: Identifier("withdraw") }, function: 15, instruction: 42, function_name: Some("withdraw") }, 14) in command 1`;
	txErr = formatSuiRefundErr(errMsg);
	expect(txErr).toBe('Tx aborted, function: Some("withdraw") reason: "insufficient bid amount for winner"');

	// Test EPaused (15) - auction is paused
	errMsg = `Error refunding: TRPCClientError: Dry run failed, could not automatically determine a budget: MoveAbort(MoveLocation { module: ModuleId { address: 3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c, name: Identifier("withdraw") }, function: 15, instruction: 42, function_name: Some("withdraw") }, 15) in command 1`;
	txErr = formatSuiRefundErr(errMsg);
	expect(txErr).toBe('Tx aborted, function: Some("withdraw") reason: "auction is paused"');
});
