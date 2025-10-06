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
	console.error(ctx);
}

// Logs the error and returns resp body as a text
export async function logHttpError(ctx: Context, resp: Response): Promise<string> {
	const body = await resp.text();
	ctx.httpError = {
		status: resp.status,
		body: body,
		url: resp.url,
	};
	console.error(ctx);
	return body;
}
