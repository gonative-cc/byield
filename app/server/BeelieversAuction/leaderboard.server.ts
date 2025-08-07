// TODO: leader board API integration
const MOCK_LEADER_BOARD_DATA = {
	leaders: [
		{
			rank: 1,
			bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "50",
		},
		{
			rank: 2,
			bidder: "0xabc123405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "45",
		},
		{
			rank: 3,
			bidder: "0xdef456405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "40",
		},
		{
			rank: 4,
			bidder: "0xghi789405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "35",
		},
		{
			rank: 5,
			bidder: "0xjkl012405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "30",
		},
		{
			rank: 6,
			bidder: "0xxyz345405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "25",
		},
	],
	bidders: 600,
	highest_bid: 100,
	entry_bid: 2,
};

export function getLeaderBoardData() {
	return { ...MOCK_LEADER_BOARD_DATA, isError: false };
}
