
------------- MINTING -------------

CREATE TABLE nbtc_minting (
	btc_tx_id TEXT PRIMARY KEY,
	sender TEXT NOT NULL, -- bitcoin sender
	amount INTEGER NOT NULL, -- amount of BTC sent to nBTC deposit
	recipient TEXT,  -- NOTE: can be invalid
	op_return TEXT, -- valid JSON
	note TEXT, -- additional note that we can include for the user
	sent_at INTEGER NOT NULL, -- timestamp
	sui_tx_id TEXT, -- the transactoin that the nBTC was minted to the recipient
	status INTEGER NOT NULL
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


------------- WITHDRAWAL -------------

CREATE TABLE nbtc_withdrawal (
	sui_tx_id TEXT PRIMARY KEY,
	sender TEXT NOT NULL, -- sui sender
	amount INTEGER NOT NULL, -- amount of nBTC to be burn and withdraw on BTC,
	recipient TEXT NOT NULL, -- the bitcoin address that will recive the BTC,
	note TEXT, -- additional note that we can include for the user. eg. you are sending funds to a collegue, this note will be included (maybe op_return?)
	sent_at INTEGER NOT NULL,
	btc_tx_id TEXT, -- at the beginning it will be null, later will appear
	status INTEGER NOT NULL
)

CREATE INDEX nbtc_withdraw_sender
	ON nbtc_withdrawal (sender);

CREATE INDEX nbtc_withdraw_recipient
	ON nbtc_withdrawal (recipient);

-- nbtc_withdrawal.status:
-- 1 = requested
-- 2 = burn
-- 3 = signing -- ika signature
-- 4 = signed
-- 5 = broadcasted to bitcoin
-- 6 = confirmations (here user technically already has the funds)
