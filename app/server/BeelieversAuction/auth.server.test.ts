import { describe, it, expect } from "vitest";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { verifySuiSignature, createSessionToken } from "./auth.server";

describe("Auction Authentication Logic", () => {
	it("should successfully verify a valid signature", async () => {
		const keypair = new Ed25519Keypair();
		const address = keypair.toSuiAddress();
		const message = `This is a test message at ${Date.now()}`;
		const messageBytes = new TextEncoder().encode(message);

		const { signature } = await keypair.signPersonalMessage(messageBytes);
		const isVerified = await verifySuiSignature(address, signature, message);

		expect(isVerified).toBe(true);
	});

	it("should fail to verify an invalid signature", async () => {
		const userKeypair = new Ed25519Keypair();
		const attackerKeypair = new Ed25519Keypair();

		const message = `This is a test message at ${Date.now()}`;
		const messageBytes = new TextEncoder().encode(message);

		const { signature } = await userKeypair.signPersonalMessage(messageBytes);
		const isVerified = await verifySuiSignature(
			attackerKeypair.toSuiAddress(),
			signature,
			message,
		);

		expect(isVerified).toBe(false);
	});

	it("should create a valid JWT session token", async () => {
		const address = new Ed25519Keypair().toSuiAddress();

		const token = await createSessionToken(address);

		expect(typeof token).toBe("string");
		expect(token.split(".").length).toBe(3);
	});
});
