import { getLeaderBoardData } from "./leaderboard.server";
import type { LoaderDataResp, AuctionDetails, User } from "./types";
import type { Req } from "./jsonrpc";
import { defaultAuctionDetails, defaultUser } from "./defaults";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { validateBidTransaction, type BidTxEvent } from "./auth.server";

import { fromBase64 } from "@mysten/utils";
import { verifySignature } from "./auth";
import { isProductionMode } from "~/lib/appenv";
import { Auction } from "./auction.server";

const maxTxIdSize = 44;

export default class Controller {
	kv: KVNamespace;
	kvKeyTx = "details";

	suiNet: "mainnet" | "testnet" | "devnet" | "localnet";
	trustedPackageId: string;
	fallbackIndexerUrl: string;

	auction: Auction;

	isProduction: boolean;

	constructor(kv: KVNamespace, d1: D1Database) {
		// TODO: use it in other functions and defaults
		this.isProduction = isProductionMode();
		this.kv = kv;
		const { startsAt, endsAt, entryBidMist } = defaultAuctionDetails();
		this.auction = new Auction(d1, new Date(startsAt), new Date(endsAt), 5810, entryBidMist);

		// TODO: update those values for mainnet!!!
		this.suiNet = "testnet";
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
		const user = userAddr !== undefined ? await this.getUserData(userAddr) : null;

		return {
			error: undefined,
			leaderboard: getLeaderBoardData(),
			details: await this.getAuctionDetails(),
			user,
		};
	}

	async handleJsonRPC(r: Request) {
		// TODO: add id in JSON RPC

		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			console.log(">>>>> deserializing json", _err);
			return new Response("Malformed JSON in request body", { status: 400 });
		}
		console.log("handle RPC", reqData);
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
				return responseNotFound("Unknown method");
		}
	}

	async getAuctionDetails(): Promise<AuctionDetails> {
		return defaultAuctionDetails();

		// const detailsJson = await this.kv.get(this.kvKeyDetails);
		// if (detailsJson !== null) {
		// 	return JSON.parse(detailsJson) as AuctionDetails;
		// }
	}

	async postBidTx(
		userAddr: string,
		txBytes: Uint8Array,
		signature: string,
		userMessage: string,
	): Promise<BidTxEvent | Response> {
		// TODO production
		if (isProductionMode()) {
			return responseNotImplemented();
		}

		const txDigest = await verifySignature(userAddr, txBytes, signature);
		if (txDigest === null) return responseNotAuthorized();
		if (txDigest.length > maxTxIdSize) {
			console.error("txDigest too long!", txDigest);
			return responseBadRequest("Bad Tx Digest");
		}

		// TODO:
		// check if tx already processed using KV

		// TODO: bid in DB

		try {
			// TODO: move to a separate function
			const suiClient = new SuiClient({ url: getFullnodeUrl(this.suiNet) });
			const validationResult = await validateBidTransaction(
				suiClient,
				txDigest,
				userAddr,
				this.trustedPackageId,
				this.fallbackIndexerUrl,
			);
			if (typeof validationResult === "string") {
				console.error("[Controller] On-chain validation failed:", validationResult);
				return responseNotAuthorized();
			}
			return validationResult;
		} catch (error) {
			console.error(
				"[Controller] An error occurred during postBidTx:",
				error instanceof Error ? error.message : String(error),
			);
			return responseServerError();
		}
	}

	// TODO check type change unknown -> null
	async getUserData(userAddr: string): Promise<User | null> {
		if (!isValidSuiAddress(userAddr)) {
			return null;
		}

		const u = await this.auction.getBidder(userAddr);
		if (u === null) {
			return defaultUser();
		}
		return u;
	}
}

function responseBadRequest(msg: string = "Bad Request"): Response {
	return new Response(msg, { status: 400 });
}

function responseNotAuthorized(msg: string = "Not Authorized"): Response {
	return new Response(msg, { status: 401 });
}

function responseNotFound(msg: string = "Not Found"): Response {
	return new Response(msg, { status: 404 });
}

function responseNotImplemented(): Response {
	return new Response("Not Implemented", { status: 501 });
}

function responseServerError(msg: string = "Server Error"): Response {
	return new Response(msg, { status: 500 });
}
