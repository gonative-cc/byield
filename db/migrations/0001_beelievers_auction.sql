-- Migration number: 0001 	 2025-08-20T15:12:54.070Z

CREATE TABLE IF NOT EXISTS bids (
  bidder    TEXT PRIMARY KEY,
  amount    INTEGER NOT NULL,
  timestamp INTEGER NOT NULL,
  wlStatus  INTEGER NOT NULL DEFAULT 0,
  note      TEXT,
  badges    TEXT DEFAULT "[]",
  bids      INTEGER DEFAULT 0,
  rank INTEGER);

CREATE INDEX IF NOT EXISTS idx_bids_ranking ON bids(
  amount DESC, timestamp ASC);

CREATE TABLE IF NOT EXISTS stats (
  key           TEXT PRIMARY KEY DEFAULT 'auction_stats',
  totalBids     INTEGER NOT NULL DEFAULT 0,
  uniqueBidders INTEGER NOT NULL DEFAULT 0);

INSERT OR IGNORE INTO stats (key) VALUES ('auction_stats');
