-- Migration number: 0002 	 2025-12-15T12:10:00.000Z

CREATE TABLE IF NOT EXISTS nft_ownership (
  collection_id TEXT NOT NULL,
  user_address  TEXT NOT NULL,
  nfts          TEXT NOT NULL,
  updated_at    INTEGER NOT NULL,
  PRIMARY KEY (collection_id, user_address)
);

CREATE INDEX IF NOT EXISTS idx_nft_ownership_updated_at ON nft_ownership(updated_at);
