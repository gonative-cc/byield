-- Migration number: 0001 	 2025-11-06T17:41:33.505Z

-- key/value store for various parameters
CREATE TABLE IF NOT EXISTS params (
  setup_id  NUMBER NOT NULL,
  name      TEXT NOT NULL,
  value     BLOB NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_params_unique ON params (setup_id, name);
