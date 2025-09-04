import { describe, test, expect } from "vitest";
import { parseTxError } from "./suierr";

describe("parseMoveAbortErr", () => {
	test("already minted msg", () => {
		const errMsg = `Error minting: TRPCClientError: Dry run failed, could not automatically determine a budget: MoveAbort(MoveLocation { module: ModuleId { address: 3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c, name: Identifier("mint") }, function: 27, instruction: 73, function_name: Some("mint") }, 4) in command 1`;
		const txErr = parseTxError(errMsg);
		expect(txErr).toEqual({ funName: 'Some("mint")', errCode: 4 });
	});

	test("user abort", () => {
		const errMsg = `Error minting: TRPCClientError: User rejected the request`;
		const txErr = parseTxError(errMsg);
		expect(txErr).toEqual("User rejected the request");
	});
});
