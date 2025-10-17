import { isProductionMode } from "./appenv";

export interface MintEvent {
	recipient: string;
	amount: string;
	fee: string;
	btcTxId: string;
	btcBlockHeight: string;
	btcTxIndex: string;
	timestampMs: string;
}

interface GraphQLEventNode {
	contents: {
		json: {
			recipient: string;
			amount: string;
			fee: string;
			btc_tx_id: number[] | string;
			btc_block_height: string;
			btc_tx_index: string;
		};
	};
	timestamp: string;
}

interface GraphQLResponse {
	data: {
		events: {
			nodes: GraphQLEventNode[];
			pageInfo: {
				hasPreviousPage: boolean;
				startCursor: string | null;
			};
		};
	};
	errors?: Array<{ message: string }>;
}

const GRAPHQL_MAINNET = "https://graphql.mainnet.sui.io/graphql";
const GRAPHQL_TESTNET = "https://graphql.testnet.sui.io/graphql";

function getGraphQLEndpoint(): string {
	return isProductionMode() ? GRAPHQL_MAINNET : GRAPHQL_TESTNET;
}

function btcTxIdToHex(btcTxId: number[] | string): string {
	if (typeof btcTxId === "string") return btcTxId;
	if (Array.isArray(btcTxId)) {
		return btcTxId.map((byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	return "";
}

function parseEvent(node: GraphQLEventNode): MintEvent {
	return {
		recipient: node.contents.json.recipient,
		amount: node.contents.json.amount,
		fee: node.contents.json.fee,
		btcTxId: btcTxIdToHex(node.contents.json.btc_tx_id),
		btcBlockHeight: node.contents.json.btc_block_height,
		btcTxIndex: node.contents.json.btc_tx_index,
		timestampMs: node.timestamp,
	};
}

export interface QueryMintEventsParams {
	cursor?: string;
	limit?: number;
	nbtcPkgId: string;
}

export interface QueryMintEventsResult {
	events: MintEvent[];
	hasNextPage: boolean;
	nextCursor: string | null;
}

export async function queryMintEvents(
	params: QueryMintEventsParams,
): Promise<QueryMintEventsResult> {
	const { cursor, limit = 10, nbtcPkgId } = params;

	const query = `
		query QueryMintEvents($cursor: String, $limit: Int!, $eventType: String!) {
			events(
				filter: { type: $eventType }
				before: $cursor
				last: $limit
			) {
				nodes {
					contents {
						json
					}
					timestamp
				}
				pageInfo {
					hasPreviousPage
					startCursor
				}
			}
		}
	`;

	const response = await fetch(getGraphQLEndpoint(), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query,
			variables: {
				cursor: cursor || null,
				limit,
				eventType: `${nbtcPkgId}::nbtc::MintEvent`,
			},
		}),
	});

	const result: GraphQLResponse = await response.json();

	if (result.errors?.length) {
		throw new Error(result.errors.map((e) => e.message).join(", "));
	}

	return {
		events: result.data.events.nodes.map(parseEvent),
		hasNextPage: result.data.events.pageInfo.hasPreviousPage,
		nextCursor: result.data.events.pageInfo.startCursor,
	};
}
