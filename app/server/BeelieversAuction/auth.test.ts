import { describe } from "vitest";
import { expect, test } from "vitest";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { toBase58 } from "@mysten/utils";

import { verifySignature } from "~/server/BeelieversAuction/auth.server";

describe("authentication testcases", () => {
	test("signature verification happy cases", async () => {
		const keypair = new Ed25519Keypair();
		const tx = new Transaction();
		tx.setGasPrice(5);
		tx.setGasBudget(100);
		tx.setGasPayment([
			{
				objectId: (Math.random() * 100000).toFixed(0).padEnd(64, "0"),
				version: String((Math.random() * 10000).toFixed(0)),
				digest: toBase58(
					new Uint8Array([
						0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4,
						5, 6, 7, 8, 9, 1, 2,
					]),
				),
			},
		]);

		tx.moveCall({
			target: "0x02::address::to_bytes",
			arguments: [tx.pure.address(keypair.toSuiAddress())],
		});

		tx.setSender(keypair.toSuiAddress());
		const txBytes = await tx.build();

		const { signature } = await keypair.signTransaction(txBytes);

		expect(await verifySignature(keypair.toSuiAddress(), txBytes, signature)).toEqual(
			await tx.getDigest(),
		);
	});

	test("signature verification failed cases", async () => {
		const keypair = new Ed25519Keypair();
		const tx = new Transaction();
		tx.setGasPrice(5);
		tx.setGasBudget(100);
		tx.setGasPayment([
			{
				objectId: (Math.random() * 100000).toFixed(0).padEnd(64, "0"),
				version: String((Math.random() * 10000).toFixed(0)),
				digest: toBase58(
					new Uint8Array([
						0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4,
						5, 6, 7, 8, 9, 1, 2,
					]),
				),
			},
		]);

		tx.moveCall({
			target: "0x02::address::to_bytes",
			arguments: [tx.pure.address(keypair.toSuiAddress())],
		});

		tx.setSender(keypair.toSuiAddress());
		const txBytes = await tx.build();

		const { signature } = await keypair.signTransaction(txBytes);

		expect(
			await verifySignature(new Ed25519Keypair().toSuiAddress(), txBytes, signature),
		).toBeNull();
	});
});
