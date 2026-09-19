-- ============================================================
-- DESTINATIONS
-- One row = one place the app can suggest (market, park, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS destinations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  city            TEXT NOT NULL,
  category        TEXT NOT NULL,        -- 'market' | 'park' | 'lake' | 'street' | 'mall' | 'heritage_site'
  lat             REAL,
  long            REAL,
  short_description TEXT,
  vibe_tags       TEXT,                 -- comma-separated: "chill,foodie" (see note below)
  budget_level    TEXT NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high'
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- FAMOUS_FOOD
-- Many rows per destination. This is the "what's famous here" content.
-- ============================================================
CREATE TABLE IF NOT EXISTS famous_food (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id  INTEGER NOT NULL,
  name            TEXT NOT NULL,        -- e.g. "Daulat ki chaat"
  note            TEXT NOT NULL,        -- one-line: why it's notable, specific stall etc.
  photo_url       TEXT,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- ============================================================
-- FAMOUS_ACTIVITIES
-- Same shape as famous_food, different content type.
-- ============================================================
CREATE TABLE IF NOT EXISTS famous_activities (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id  INTEGER NOT NULL,
  name            TEXT NOT NULL,
  note            TEXT NOT NULL,
  photo_url       TEXT,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Speed up the main query pattern: "give me food/activities for destination X"
CREATE INDEX IF NOT EXISTS idx_food_dest ON famous_food(destination_id);
CREATE INDEX IF NOT EXISTS idx_activity_dest ON famous_activities(destination_id);
