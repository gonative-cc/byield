import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { toBase64 } from "@mysten/sui/utils";

// TODO: use cloudfare secretes
const JWT_SECRET = "lreplace_secret";
const encoder = new TextEncoder();
const JWT_ALG = { name: "HMAC", hash: "SHA-256" };

export async function verifySuiSignature(
	address: string,
	signature: string,
	message: string,
): Promise<boolean> {
	try {
		const messageBytes = new TextEncoder().encode(message);
		const publicKey = await verifyPersonalMessageSignature(messageBytes, signature);
		const recoveredAddress = publicKey.toSuiAddress();
		return recoveredAddress === address;
	} catch (error) {
		console.error("failed to verify the log-in message:", error);
		return false;
	}
}

export async function createSessionToken(address: string): Promise<string> {
	const header = { alg: "HS256", typ: "JWT" };
	const payload = {
		sub: address,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Expires in 24 hours
	};

	const key = await crypto.subtle.importKey("raw", encoder.encode(JWT_SECRET), JWT_ALG, false, [
		"sign",
	]);

	const partialToken = `${toBase64(encoder.encode(JSON.stringify(header)))}.${toBase64(
		encoder.encode(JSON.stringify(payload)),
	)}`;
	const signature = await crypto.subtle.sign(JWT_ALG.name, key, encoder.encode(partialToken));

	return `${partialToken}.${toBase64(new Uint8Array(signature))}`;
}
