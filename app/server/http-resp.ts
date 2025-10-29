import { logError, logHttpError } from "~/lib/log";

export function badRequest(msg: string = "Bad Request"): Response {
	return new Response(msg, { status: 400 });
}

export function notAuthorized(msg: string = "Not Authorized"): Response {
	return new Response(msg, { status: 401 });
}

export function notFound(msg: string = "Not Found"): Response {
	return new Response(msg, { status: 404 });
}

export function notImplemented(): Response {
	return new Response("Not Implemented", { status: 501 });
}

// creates response, with content-type header set to text/plain
export function textOK(o: string | null): Response {
	return new Response(o);
}

// logs and handles server error
// * method: server method ID, should be in the following format: <server_name>:<method_name>
export function serverError(
	method: string,
	error: unknown,
	msg: string = "Server Error",
): Response {
	logError({ method, msg }, error);
	return new Response(msg, { status: 500 });
}

// creates response, with content-type header set to text/plain
// * method: server method ID, should be in the following format: <server_name>:<method_name>
export async function handleNonSuccessResp(
	method: string,
	msg: string,
	r: Response,
): Promise<Response> {
	const ctx = { method, msg };
	const body = await logHttpError(ctx, r);
	return new Response(msg + ".\n" + body, { status: r.status });
}
