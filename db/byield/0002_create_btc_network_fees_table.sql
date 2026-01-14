-- Migration number: 0002 	 2026-01-13T11:37:44.342Z

CREATE TABLE IF NOT EXISTS btc_network_fee (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    network TEXT NOT NULL UNIQUE CHECK (
        network IN ('Mainnet', 'Testnet', 'Testnet4', 'Signet', 'Regtest')
    ),
    total_fee_sats TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_btc_fees_updated_at ON btc_network_fee(updated_at);

-- Insert btc regtest network fee
INSERT INTO btc_network_fee (network, total_fee_sats) VALUES ('Regtest', '1');
