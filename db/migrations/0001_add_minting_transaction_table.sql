-- Migration number: 0001 	 2025-05-06T06:27:42.779Z
CREATE TABLE minting_transactions (
    txid TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'failed'))
);
