import { getLeaderBoardData } from "./leaderboard.server";
import type { LoaderDataResp, AuctionDetails, User } from "./types";
import { defaultAuctionDetails, defaultUser } from "./defaults";
import { verifyTransactionSignature } from "@mysten/sui/verify";
import { TransactionDataBuilder } from "@mysten/sui/transactions";

export default class Controller {
	kv: KVNamespace;
	kvKeyDetails = "details";
	kvKeyLeaderboard = "lead";
	kvKeyUserPrefix = "u_";

	constructor(kv: KVNamespace) {
		this.kv = kv;
	}

	async loadPageData(userAddr?: string): Promise<LoaderDataResp> {
		// TODO: add user data if a use is connected
		const user = userAddr !== undefined ? await this.getUserData(userAddr) : undefined;

		return {
			error: undefined,
			leaderboard: getLeaderBoardData(),
			details: await this.getAuctionDetails(),
			user,
		};
	}

	async getAuctionDetails(): Promise<AuctionDetails> {
		const detailsJson = await this.kv.get(this.kvKeyDetails);
		if (detailsJson !== null) {
			return JSON.parse(detailsJson) as AuctionDetails;
		}
		const details = defaultAuctionDetails();
		await this.kv.put(this.kvKeyDetails, JSON.stringify(details));
		return details;
	}

	async postBidTx(userAddr: string, tx_bytes: Uint8Array, signature: string) {
		// TODO authentication
		// TODO: Vu - could you check up if we pass the full signed TX, and user address, can we
		// verify if the given address signed TX? If yes, then we sole authentication

		// throw error if signature in valid from userAddr
		await verifyTransactionSignature(tx_bytes, signature, {
			address: userAddr,
		});

		const txDigest = TransactionDataBuilder.getDigestFromBytes(tx_bytes);

		console.log(txDigest, userAddr);
	}

	async getUserData(userAddr: string): Promise<User> {
		// TODO: validate Sui address
		const userJson = await this.kv.get(this.kvKeyUserPrefix + userAddr);
		if (userJson === null) {
			return defaultUser();
		}
		return JSON.parse(userJson) as User;
	}
}
