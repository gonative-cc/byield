import {
	AuctionAccountType,
	Badge,
	type AuctionInfo,
	type User,
	type Bidder,
	type Raffle,
} from './types';

export function defaultAuctionInfo(_production: boolean): AuctionInfo {
	// TODO: make an env Var
	// if (!production) {
	// 	return testAuctionDetails();
	// }
	const startsAt = +new Date('2025-08-21T13:00:00Z');
	return {
		// TODO: move this and use DB records!
		totalBids: 0,
		uniqueBidders: 0,
		highestBidMist: 0,

		entryBidMist: 1e9, // 1 SUI
		startsAt,
		endsAt: startsAt + 48 * 3600_000,
		auctionSize: 5810,
		clearingPrice: null,
	};
}
/* eslint-disable @typescript-eslint/no-unused-vars */
function testAuctionDetails(): AuctionInfo {
	const oneHour = 3600_000;
	const startsAt = +new Date() - oneHour;
	return {
		uniqueBidders: 100,
		totalBids: 100,
		highestBidMist: 10e9,

		entryBidMist: 1e6, //  0.001 SUI
		startsAt,
		endsAt: startsAt + 10 * oneHour,
		auctionSize: 10,
		clearingPrice: null,
	};
}

export function defaultUser(_production: boolean): User {
	return {
		rank: null,
		amount: 0,
		badges: [],
		note: '',
		wlStatus: AuctionAccountType.DEFAULT,
		bids: 0,
	};
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function defaultTestUser(): User {
	return {
		rank: 9, // rank starts from 1
		amount: 12e8, // 1.2 SUI
		badges: [
			Badge.top_10,
			Badge.top_21,
			Badge.top_100,
			Badge.bid_over_5,
			Badge.nbtc_every_21st_bidder,
		],
		note: "I'm Beellish!",
		wlStatus: AuctionAccountType.PARTNER_WHITELIST,
		bids: 4,
	};
}

// TODO: leader board API integration
const MOCK_LEADER_BOARD_DATA: Bidder[] = [
	{
		rank: 1,
		bidder: '0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4',
		amount: 100, // Highest bid - will get "highest single bid" badge
		badges: [Badge.first_place, Badge.highest_bid],
		note: '',
		bids: 2,
	},
	{
		rank: 2,
		bidder: '0xabc123405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4',
		amount: 45,
		badges: [],
		note: '',
		bids: 2,
	},
	{
		rank: 3,
		bidder: '0xdef456405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4',
		amount: 40,
		badges: [],
		note: '',
		bids: 2,
	},
	{
		rank: 10,
		bidder: '0xghi789405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4',
		amount: 15, // Rank 10 - will get "Logo Ika red every 10th position" badge
		badges: [],
		note: '',
		bids: 2,
	},
	{
		rank: 20,
		bidder: '0xjkl012405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4',
		amount: 12, // Rank 20 - will get "Logo Ika red every 10th position" badge
		badges: [],
		note: '',
		bids: 2,
	},
	{
		rank: 21,
		bidder: '0xxyz345405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4',
		amount: 11, // Rank 21 - will get "nbtc every 21st bidder" badge
		badges: [],
		note: '',
		bids: 2,
	},
	{
		rank: 50,
		bidder: '0xaaa111405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4',
		amount: 8,
		badges: [],
		note: '',
		bids: 2,
	},
	{
		rank: 100,
		bidder: '0xbbb222405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4',
		amount: 6, // Rank 100 - will get "Whale for top 100" badge
		badges: [],
		note: '',
		bids: 2,
	},
];

function mkRaffleRecord(id: number, address: string, amount: number): Raffle {
	return { id, address, amount };
}

export function mainnetRaffleWinners(): Raffle[] {
	const addresses = [
		'0x493633da8c338d790fb5bc5707a6c0af978f68fd0f0cf357b3ab9239285dde31',
		'0x981d282f0ffd27497076f8f225339a180ac16cc9c5fa2e07f5d1f92884669273',
		'0x72a7571530d4142abefa8dc74b36caa3bbc02b11f57c3c9720d33bdb00aa84bf',
		'0x45093950b74c2526e5faf2bca135488393c68f5a949f155c49dabcaa853b8d12',
		'0x9fa0ff3fe81ed4f8d85fd2062b42a641a45757a414c7422854b511db962b134f',
		'0x16784d78782687f46f2c81498ca61254ebfb4918527a338eb378ce2b40ceae39',
		'0x59d0f1943c0e725957217a73d043e049915f8824688502059338bd7f64b3717c',
		'0xc918605b14374d48f80ebab1f8a12549b69f6ac171b7a37c64118de670eecf18',
		'0x0de34fbde1a0a67e5dc396a663923978267a0087d0f750c54c50bd27d27acd94',
		'0x2f7fd77a9e4ef6c2add12430f3b1c8fd4816f8bcae4728b1aaee1748182e75e6',
		'0x8a2ee101fb7aad5489ce38a5bda27dd7f99eed264589fc02a98e391db01b4d08',
		'0x664b55ca51745075c2b3b902873ee8d8213c4366bd41fec30e58537419ea8da3',
		'0x89b867a7d9e3da81111d2089eb18632944b2605e74098ee1923ae9408808ed22',
		'0x9066fc8f591cc9a4daadaa79614883f094238720be57ad76673db1b3e9a36a08',
		'0x2b1adf514ce77632a1b844524186932e3e3989046d0539fc955edd9f6fa5047f',
		'0x7a231712764fbe9a428d221f94cf3e912deec24911f19404582effcd0ec36c59',
		'0x81a5fcae846cc57363b02b64ab21cf3b832f54aa6d70979c32d011ba8970a1f8',
		'0x29a701cc13c61fbee1fd1b4212cadf09620de6eaecfbf00321d10affb4f6efbd',
		'0x5cf9264e00d543d4e8d665057b7a0a61ef163004ec5e8d10381eb65f62d19849',
		'0x0e0320f4b92ede52f0f4a4f201bbe7c48f70e3f3349389c69d2d54d5dbca2ea0',
		'0x12e85865d49e82df95f1e561a3f4c34ec676bfae23d79ab26396d3da6f9ebc98',
	];

	return addresses.map((address, i) => mkRaffleRecord(i + 1, address, 445956));
}
