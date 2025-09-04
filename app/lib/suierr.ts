import { extractFirstInteger } from "./parser";

export interface MoveAbort {
	funName: string;
	errCode?: number;
}

// returns
// - empty string if err is not defined
// - original err if MoveAbort is not present
// - parsed Error code and function name if MoveAbort is detected
export function parseMoveAbortErr(err: string): MoveAbort | unknown {
	// example error:
	// MoveAbort(MoveLocation { module: ModuleId { address: 3064d43ee6cc4d703d4c10089786f0ae805b24d2d031326520131d78667ffc2c, name: Identifier("mint") }, function: 27, instruction: 73, function_name: Some("mint") }, 4)

	if (!err) return undefined;
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
