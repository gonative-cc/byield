import { getLeaderBoardData } from "./leaderboard.server";
import type { LoaderDataResp, AuctionDetails, User } from "./types";
import type { Req } from "./jsonrpc";
import { defaultAuctionDetails, defaultUser } from "./defaults";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { validateBidTransaction, type BidTxEvent } from "./auth.server";

import { fromBase64 } from "@mysten/utils";
import { verifySignature } from "./auth";

export default class Controller {
	kv: KVNamespace;
	kvKeyDetails = "details";
	kvKeyLeaderboard = "lead";
	kvKeyUserPrefix = "u_";
	suiClient: SuiClient;
	trustedPackageId: string;
	fallbackIndexerUrl: string;

	constructor(kv: KVNamespace) {
		this.kv = kv;
		// TODO: update those values for mainnet!!!
		this.suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
		this.trustedPackageId =
			"0xd5b24b83b168f8656aa7c05af1256e6115de1b80d97be0cddf19297a15535149";
		this.fallbackIndexerUrl = "https://sui-testnet-endpoint.blockvision.org/";

		if (!this.trustedPackageId || !this.fallbackIndexerUrl) {
			throw new Error(
				"Missing required environment variables: TRUSTED_PACKAGE_ID and FALLBACK_INDEXER_URL must be set.",
			);
		}
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

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			return new Response("Malformed JSON in request body", { status: 400 });
		}
		switch (reqData.method) {
			case "queryUser":
				return this.getUserData(reqData.params[0]);
			case "queryAuctionDetails":
				return await this.getAuctionDetails();
			case "postBidTx": {
				const [userAddr, txBytes, signature, userMessage] = reqData.params;
				return this.postBidTx(userAddr, fromBase64(txBytes), signature, userMessage);
			}
			case "pageData": {
				const [suiAddr] = reqData.params;
				return this.loadPageData(suiAddr);
			}
			default:
				return new Response("Unknown method", { status: 404 });
		}
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

	async postBidTx(
		userAddr: string,
		txBytes: Uint8Array,
		signature: string,
		userMessage: string,
	): Promise<BidTxEvent | null> {
		try {
			// TODO authentication
			// TODO: Vu - could you check up if we pass the full signed TX, and user address, can we
			// verify if the given address signed TX? If yes, then we sole authentication

			// throw error if signature in valid from userAddr

			const txDigest = await verifySignature(userAddr, txBytes, signature);
			const validationResult = await validateBidTransaction(
				this.suiClient,
				txDigest,
				userAddr,
				this.trustedPackageId,
				this.fallbackIndexerUrl,
			);
			if (typeof validationResult === "string") {
				console.error(`[Controller] On-chain validation failed: ${validationResult}`);
				throw new Error("On-chain validation failed.");
			}
			return validationResult;
		} catch (error) {
			console.error(
				`[Controller] An error occurred during postBidTx: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return null;
		}
	}

	async getUserData(userAddr: string): Promise<User | undefined> {
		if (!isValidSuiAddress(userAddr)) {
			return undefined;
		}
		const userJson = await this.kv.get(this.kvKeyUserPrefix + userAddr);
		if (userJson === null) {
			return defaultUser();
		}
		return JSON.parse(userJson) as User;
	}
}
