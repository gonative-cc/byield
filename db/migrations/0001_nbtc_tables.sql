
------------- MINTING -------------

CREATE TABLE nbtc_minting (
	btc_txid TEXT PRIMARY KEY,
	sender TEXT NOT NULL, -- bitcoin sender
	amount INTEGER NOT NULL, -- amount of BTC sent to nBTC deposit
	recipient TEXT,  -- NOTE: can be invalid
	op_return TEXT, -- valid JSON
	note TEXT, -- additional note that we can include for the user
	sent_at INTEGER NOT NULL, -- timestamp
	status INTEGER NOT NULL CHECK(status IN (1,2,3))
	-- confirmations INTEGER NOT NULL,
);

CREATE INDEX nbtc_minting_sender
	ON nbtc_minting (sender);

CREATE INDEX nbtc_minting_recipient
	ON nbtc_minting (recipient);

-- nbtc_minting.status:
--   1 = broadcasted
--   2 = confirming -- probably we don't need that if we use GoMaestro
--   3 = proving
--   4 = nBTC minting
--   5 = done
--   6 = bitcoin failed (eg tx not valid)
--   7 = bitcoin reorg
--   8 = nbtc broadcast faild
--   9 = nbtc verification failed

-- nbtc_minting.recipient:
--   null -- op_return is not valid

-- nbtc_minting.op_return
--   JSON structure: JSON {error?: text, recipient?: sui_address, contract_call?: "sui_tx"}
--   if op_return is not valid: we set error and other fields are empty.
--   otherwise: we copy the op_return value here


------------- WITHDRAW -------------

-- TODO
