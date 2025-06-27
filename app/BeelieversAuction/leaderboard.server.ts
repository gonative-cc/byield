// TODO: leader board API integration
const MOCK_LEADER_BOARD_DATA = {
	leaders: [
		{
			rank: 1,
			bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			time: 12,
			amount: "20",
		},
		{
			rank: 1,
			bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			time: 12,
			amount: "20",
		},
		{
			rank: 1,
			bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			time: 12,
			amount: "20",
		},
		{
			rank: 1,
			bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			time: 12,
			amount: "20",
		},
		{
			rank: 1,
			bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			time: 12,
			amount: "20",
		},
		{
			rank: 1,
			bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			time: 12,
			amount: "20",
		},
	],
	bidders: 600,
	highest_bid: 100,
	entry_bid: 2,
};

export function getLeaderBoardData() {
	return { ...MOCK_LEADER_BOARD_DATA, isError: false };
}
