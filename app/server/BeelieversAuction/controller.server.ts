import { isValidSuiAddress } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

import type { LoaderDataResp, AuctionInfo, User, Bidder } from "./types";
import type { Req } from "./jsonrpc";
import { defaultAuctionInfo, defaultUser } from "./defaults";
import { checkTxOnChain } from "./auth.server";

import { fromBase64 } from "@mysten/utils";
import { verifySignature } from "./auth";
import { isProductionMode } from "~/lib/appenv";
import { Auction, type BidResult } from "./auction.server";

const maxTxIdSize = 44;

export default class Controller {
	kv: KVNamespace;
	kvKeyTxPrefix = "tx_";

	suiNet: "mainnet" | "testnet" | "devnet" | "localnet";
	trustedPackageId: string;
	fallbackIndexerUrl: string;

	auction: Auction;
	auctionInfo: AuctionInfo;

	isProduction: boolean;

	constructor(kv: KVNamespace, d1: D1Database) {
		this.isProduction = isProductionMode();
		this.kv = kv;

		const ai = defaultAuctionInfo(this.isProduction);
		this.auctionInfo = ai;
		this.auction = new Auction(
			d1,
			new Date(ai.startsAt),
			new Date(ai.endsAt),
			ai.auctionSize,
			ai.entryBidMist,
		);

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
			leaderboard: await this.auction.getTopLeaderboard(),
			details: this.auctionInfo,
			user,
		};
	}

	async handleJsonRPC(r: Request) {
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
				return this.auctionInfo;
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

	// TODO: should return new User record
	async postBidTx(
		userAddr: string,
		txBytes: Uint8Array,
		signature: string,
		userMessage?: string,
	): Promise<BidResult | Response> {
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

		const keyKv = this.kvKeyTxPrefix + txDigest;
		const kvCheck = await this.kv.get(keyKv);
		if (kvCheck !== null) return responseOK("already processed");

		const suiClient = new SuiClient({ url: getFullnodeUrl(this.suiNet) });
		try {
			const bidEvent = await checkTxOnChain(
				suiClient,
				txDigest,
				userAddr,
				this.trustedPackageId,
				this.fallbackIndexerUrl,
			);
			if (typeof bidEvent === "string") {
				console.error("[Controller] On-chain validation failed:", bidEvent);
				return responseNotAuthorized();
			}

			await this.kv.put(keyKv, "");
			const amount = Number(bidEvent.totalBidAmount);
			console.log(">>>> bidEvent", bidEvent);
			const [resp, err] = await this.auction.bid(userAddr, amount, userMessage);
			if (err !== null) return responseBadRequest(err.message);
			return resp || { oldRank: 0, newRank: 0 };
		} catch (error) {
			console.error(
				"[Controller] An error occurred during postBidTx:",
				error instanceof Error ? error.message : String(error),
			);
			return responseServerError(String(error));
		}
	}

	async getUserData(userAddr: string): Promise<User | null> {
		if (!isValidSuiAddress(userAddr)) {
			return null;
		}

		const u = await this.auction.getBidder(userAddr);
		if (u === null) {
			return defaultUser(this.isProduction);
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

// TODO: make JSON RPC response
function responseOK(o: string | null): Response {
	return new Response(
		o,
		// {headers: {"Content-Type": "application/json",},}
	);
}
