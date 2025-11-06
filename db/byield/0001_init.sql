-- Migration number: 0001 	 2025-11-06T17:41:33.505Z

CREATE TABLE IF NOT EXISTS cbtc (
  network   TEXT NOT NULL,
  name      TEXT NOT NULL,
  btc_addr  TEXT NOT NULL,
  cbtc_pkg  TEXT NOT NULL,
  cbtc_obj  TEXT NOT NULL,
  note      TEXT);
