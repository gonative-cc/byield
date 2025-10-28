import { isValidSuiAddress } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

import type { LoaderDataResp, AuctionInfo } from "./types";
import type { QueryRaffleResp, Req, QueryUserResp } from "./jsonrpc";
import { Network } from "./jsonrpc";
import { defaultAuctionInfo, defaultUser, mainnetRaffleWinners } from "./defaults";
import { checkTxOnChain, verifySignature } from "./auth.server";

import { fromBase64 } from "@mysten/utils";
import { isProductionMode } from "~/lib/appenv";
import { Auction, type BidResult } from "./auction.server";

import { mainnetCfg, testnetCfg } from "~/config/sui/contracts-config";
import * as httpresp from "../http-resp";
import { logError } from "~/lib/log";

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

	tradeportApiUser: string;
	tradeportApiKey: string;

	constructor(
		kv: KVNamespace,
		d1: D1Database,
		tradeportApiUser: string,
		tradeportApiKey: string,
	) {
		this.isProduction = isProductionMode();
		if (this.isProduction) {
			this.suiNet = "mainnet";
			this.auctionPkgId = mainnetCfg.beelieversAuction.pkgId;
			this.fallbackIndexerUrl = "https://sui-mainnet-endpoint.blockvision.org/";
		} else {
			this.suiNet = "testnet";
			this.auctionPkgId = testnetCfg.beelieversAuction.pkgId;
			this.fallbackIndexerUrl = "https://sui-testnet-endpoint.blockvision.org/";
		}
		if (!this.auctionPkgId || !this.fallbackIndexerUrl) {
			throw new Error(
				"Missing required configuration values: auctionPkgId and fallbackIndexerUrl must be set in the config files.",
			);
		}

		this.kv = kv;
		this.tradeportApiUser = tradeportApiUser;
		this.tradeportApiKey = tradeportApiKey;

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
			logError({ msg: "handle RPC", method: r.method }, _err);
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
			case "checkNftOwnership": {
				const [userAddress, network] = reqData.params;
				return this.checkNftOwnership(userAddress, network);
			}
			default:
				return httpresp.notFound("Unknown method");
		}
	}

	async postBidTx(
		userAddr: string,
		txBytes: Uint8Array,
		signature: string,
		userMessage?: string,
	): Promise<BidResult | Response> {
		const txDigest = await verifySignature(userAddr, txBytes, signature);
		if (txDigest === null) return httpresp.notAuthorized();
		if (txDigest.length > maxTxIdSize) {
			console.error("txDigest too long!", txDigest);
			return httpresp.badRequest("Bad Tx Digest");
		}
		// TODO: Vu: extract timestamp from txBytes

		const keyKv = this.kvKeyTxPrefix + txDigest;
		const kvCheck = await this.kv.get(keyKv);
		if (kvCheck !== null) return httpresp.textOK("already processed");

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
				return httpresp.notAuthorized();
			}
			await this.kv.put(keyKv, "");
			const amount = Number(bidEvent.totalBidAmount);
			const timestampMs = parseInt(bidEvent.timestampMs);
			const [resp, err] = await this.auction.bid(userAddr, amount, timestampMs, userMessage);
			if (err !== null) return httpresp.badRequest(err.message);

			return resp || { oldRank: 0, newRank: 0 };
		} catch (error) {
			return httpresp.serverError("beelieversAuction:postBidTx", error);
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

	async checkNftOwnership(userAddress: string, _network: Network): Promise<boolean> {
		const beelieverCollectionId = "6496c047-dcdd-44e2-b8ca-13c27ac0478a";

		try {
			const query = `
				query CheckBeelieverOwnership($owner: String!, $collectionId: uuid!) {
					sui {
						nfts(
							where: { 
								owner: { _eq: $owner }
								collection_id: { _eq: $collectionId }
								burned: { _eq: false }
							}
							limit: 1
						) {
							id
						}
					}
				}
			`;

			const response = await fetch("https://api.indexer.xyz/graphql", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-user": this.tradeportApiUser,
					"x-api-key": this.tradeportApiKey,
				},
				body: JSON.stringify({
					query,
					variables: { owner: userAddress, collectionId: beelieverCollectionId },
				}),
			});

			if (!response.ok) return false;

			const result = (await response.json()) as {
				data?: { sui?: { nfts?: Array<{ id: string }> } };
				errors?: { message: string }[];
			};

			if (result.errors) return false;

			return (result.data?.sui?.nfts || []).length > 0;
		} catch (error) {
			logError({ msg: "Failed to check NFT ownership", method: "checkNftOwnership" }, error);
			return false;
		}
	}
}
