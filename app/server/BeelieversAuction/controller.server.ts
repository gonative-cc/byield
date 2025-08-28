import { isValidSuiAddress } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

import type { LoaderDataResp, AuctionInfo } from "./types";
import type { QueryRaffleResp, Req, QueryUserResp } from "./jsonrpc";
import { defaultAuctionInfo, defaultUser, mainnetRaffleWinners } from "./defaults";
import { checkTxOnChain, verifySignature } from "./auth.server";

import { fromBase64 } from "@mysten/utils";
import { isProductionMode } from "~/lib/appenv";
import { Auction, type BidResult } from "./auction.server";

import suiTestNetConfig from "~/config/sui/contracts-testnet.json";
import suiMainNetConfig from "~/config/sui/contracts-mainnet.json";

const maxTxIdSize = 44;

export default class Controller {
	kv: KVNamespace;
	kvKeyTxPrefix = "tx_";
	kvKeyTxPrefixNotAuthorized = "txNA_";

	suiNet: "mainnet" | "testnet" | "devnet" | "localnet";
	auctionPkgId: string; // Sui package object ID
	fallbackIndexerUrl: string;

	auction: Auction;
	auctionInfo: AuctionInfo;

	isProduction: boolean;
	// hardcoded based on the mainnet result
	finalized_clearing_price = 5260500000;

	constructor(kv: KVNamespace, d1: D1Database) {
		this.isProduction = isProductionMode();
		if (this.isProduction) {
			this.suiNet = "mainnet";
			this.auctionPkgId = suiMainNetConfig.auctionBidApi.packageId;
			this.fallbackIndexerUrl = "https://sui-mainnet-endpoint.blockvision.org/";
		} else {
			this.suiNet = "testnet";
			this.auctionPkgId = suiTestNetConfig.auctionBidApi.packageId;
			this.fallbackIndexerUrl = "https://sui-testnet-endpoint.blockvision.org/";
		}
		if (!this.auctionPkgId || !this.fallbackIndexerUrl) {
			throw new Error(
				"Missing required configuration values: auctionPkgId and fallbackIndexerUrl must be set in the config files.",
			);
		}

		this.kv = kv;

		const ai = defaultAuctionInfo(this.isProduction);
		this.auctionInfo = ai;
		this.auction = new Auction(
			d1,
			new Date(ai.startsAt),
			new Date(ai.endsAt),
			ai.auctionSize,
			ai.entryBidMist,
			this.finalized_clearing_price,
		);
	}

	async loadPageData(userAddr?: string): Promise<LoaderDataResp> {
		const user = userAddr !== undefined ? await this.getUserData(userAddr) : null;
		const details = this.auctionInfo;
		const stats = await this.auction.getAuctionTopStats();
		const leaderboard = await this.auction.getTopLeaderboard();
		details.totalBids = stats.totalBids;
		details.uniqueBidders = stats.uniqueBidders;
		details.highestBidMist = leaderboard.length === 0 ? 0 : leaderboard[0].amount;
		details.clearingPrice = this.finalized_clearing_price;

		if (stats.uniqueBidders >= this.auction.size) {
			const entryBid = await this.auction.getLastWinningPrice();
			// we add 0.1 SUI as the min step to bid
			if (entryBid !== null) details.entryBidMist = entryBid + 1e8;
		}

		return {
			error: undefined,
			leaderboard,
			details: this.auctionInfo,
			user,
		};
	}

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			console.log(">>>>> Expected JSON content type:", _err);
			return new Response("Expecting JSON Content-Type and JSON body", {
				status: 400,
			});
		}
		console.log("handle RPC", reqData);
		switch (reqData.method) {
			case "queryUser":
				return this.getUserData(reqData.params[0]);
			case "postBidTx": {
				const [userAddr, txBytes, signature, userMessage] = reqData.params;
				return this.postBidTx(userAddr, fromBase64(txBytes), signature, userMessage);
			}
			case "pageData": {
				const [suiAddr] = reqData.params;
				return this.loadPageData(suiAddr);
			}
			case "queryRaffle": {
				return this.getRaffle();
			}
			default:
				return responseNotFound("Unknown method");
		}
	}

	async postBidTx(
		userAddr: string,
		txBytes: Uint8Array,
		signature: string,
		userMessage?: string,
	): Promise<BidResult | Response> {
		const txDigest = await verifySignature(userAddr, txBytes, signature);
		if (txDigest === null) return responseNotAuthorized();
		if (txDigest.length > maxTxIdSize) {
			console.error("txDigest too long!", txDigest);
			return responseBadRequest("Bad Tx Digest");
		}
		// TODO: Vu: extract timestamp from txBytes

		const keyKv = this.kvKeyTxPrefix + txDigest;
		const kvCheck = await this.kv.get(keyKv);
		if (kvCheck !== null) return responseOK("already processed");

		const suiClient = new SuiClient({ url: getFullnodeUrl(this.suiNet) });
		try {
			const bidEvent = await checkTxOnChain(
				suiClient,
				txDigest,
				userAddr,
				this.auctionPkgId,
				this.fallbackIndexerUrl,
			);
			if (typeof bidEvent === "string") {
				console.error("[Controller] On-chain validation failed:", bidEvent);
				const keyKvNA = this.kvKeyTxPrefixNotAuthorized + txDigest;
				await this.kv.put(keyKvNA, "");
				return responseNotAuthorized();
			}
			await this.kv.put(keyKv, "");
			const amount = Number(bidEvent.totalBidAmount);
			const timestampMs = parseInt(bidEvent.timestampMs);
			const [resp, err] = await this.auction.bid(userAddr, amount, timestampMs, userMessage);
			if (err !== null) return responseBadRequest(err.message);

			return resp || { oldRank: 0, newRank: 0, timestampMs: 0 };
		} catch (error) {
			console.error(
				"[Controller] An error occurred during postBidTx:",
				error instanceof Error ? error.message : String(error),
			);
			return responseServerError(String(error));
		}
	}

	async getUserData(userAddr: string): Promise<QueryUserResp> {
		if (!isValidSuiAddress(userAddr)) {
			return null;
		}

		const u = await this.auction.getBidder(userAddr);
		if (u === null) {
			return defaultUser(this.isProduction);
		} else {
			u.amount = Math.floor(u.amount);
		}
		return u;
	}

	async getRaffle(): Promise<QueryRaffleResp> {
		// hardcoded values based on mainnet events
		// https://suivision.xyz/txblock/6DsEZJ7AtyZ4QanoH4iw3QA5NpcfFvWA98AAJxk1wYea?tab=Events
		return {
			winners: mainnetRaffleWinners(),
			totalAmount: 93650950,
		};
	}
}

/* eslint-disable @typescript-eslint/no-unused-vars */

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
