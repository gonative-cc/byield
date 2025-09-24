 

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

export function serverError(msg: string = "Server Error"): Response {
	return new Response(msg, { status: 500 });
}

// creates response, with content-type header set to text/plain
export function textOK(o: string | null): Response {
	return new Response(o);
}
