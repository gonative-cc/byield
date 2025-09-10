import { extractFirstInteger } from "./parser";

export interface MoveAbort {
	funName?: string;
	errCode?: number;
}

// returns
// - empty string if err is not defined
// - original err if MoveAbort is not present
// - parsed Error code and function name if MoveAbort is detected
export function parseTxError(err: string): MoveAbort | string | unknown {
	// example error:
	// MoveAbort(MoveLocation { module: ModuleId { address: 3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c, name: Identifier("mint") }, function: 27, instruction: 73, function_name: Some("mint") }, 4)

	if (!err) return undefined;

	const trpcErr = "TRPCClientError: ";
	const userErr = "TRPCClientError: User";
	const userErrIdx = err.indexOf(userErr);
	if (userErrIdx >= 0) {
		return err.slice(userErrIdx + trpcErr.length);
	}

	const abortIdx = err.indexOf("MoveAbort");
	if (abortIdx < 0) return undefined;

	try {
		err = err.slice(abortIdx);
		const funNameIdentifier = "function_name:";
		err = err.slice(err.indexOf("function_name:") + funNameIdentifier.length + 1);
		const endFunIdx = err.indexOf(")") + 1;
		const funName = err.slice(0, endFunIdx);
		err = err.slice(endFunIdx);
		const errCode = extractFirstInteger(err) || undefined;
		return { funName, errCode };
	} catch {
		return { funName: "unknown" };
	}
}

/**
 * Common function to format Sui transaction errors with custom error code formatter
 * @param error - The error object or string
 * @param errCodeFormatter - Function that takes error code and returns human-readable message
 * @param defaultMsg - Default error message when parsing fails
 * @returns Formatted error message
 */
export function formatSuiErr(
	error: unknown,
	errCodeFormatter: (errCode: number) => string,
	defaultMsg: string,
): string {
	// Handle both string and Error object inputs
	let errMsg: string;
	if (typeof error === "string") {
		errMsg = error;
	} else {
		errMsg = (error as Error).message;
	}

	if (!errMsg) return defaultMsg;

	const txErr = parseTxError(errMsg);
	if (!txErr) return "Sui tx failed, unknown error";
	if (typeof txErr === "string") return txErr;

	if (typeof txErr === "object" && txErr !== null && "errCode" in txErr && "funName" in txErr) {
		const errCode = typeof txErr.errCode === "number" ? txErr.errCode : 0;
		const reason = errCodeFormatter(errCode);
		return `Tx aborted, function: ${txErr.funName} reason: "${reason}"`;
	}

	return defaultMsg;
}
