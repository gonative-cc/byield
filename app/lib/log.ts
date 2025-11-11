// Context field for a sub-http request
export interface HttpError {
	status: number;
	body: string;
	url: string;
}

export interface Context {
	msg: string;
	method: string;
	error?: unknown;
	httpError?: HttpError;
	[key: string]: unknown;
}

export function logError(ctx: Context, error?: unknown) {
	if (error !== undefined) {
		if (error instanceof Error) {
			ctx.error = {
				name: error.name,
				message: error.message,
				cause: error.cause,
				stack: error.stack,
			};
		} else {
			ctx.error = error;
		}
	}
	logger.error(ctx);
}

// Logs the error and returns resp body as a text
export async function logHttpError(ctx: Context, resp: Response): Promise<string> {
	const body = await resp.text();
	ctx.httpError = {
		status: resp.status,
		body: body,
		url: resp.url,
	};
	logger.error(ctx);
	return body;
}

export interface LogData {
	msg: string;
	[key: string]: unknown;
}

function log(level: "debug" | "info" | "warn" | "error", data: LogData) {
	const output = { ...data, level };
	console[level === "info" ? "log" : level](output);
}

export const logger = {
	debug: (data: LogData) => log("debug", data),
	info: (data: LogData) => log("info", data),
	warn: (data: LogData) => log("warn", data),
	error: (data: LogData) => log("error", data),
};
