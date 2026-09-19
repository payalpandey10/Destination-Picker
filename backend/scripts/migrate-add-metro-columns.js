// migrate-add-metro-columns.js
// Adds nearest_metro_station and metro_gate columns to an EXISTING
// database. Safe to run multiple times — checks if each column
// already exists before trying to add it.
// Run: node --experimental-sqlite scripts/migrate-add-metro-columns.js

const db = require('../src/db');

const existingColumns = db.prepare('PRAGMA table_info(destinations)').all().map((c) => c.name);

if (!existingColumns.includes('nearest_metro_station')) {
  db.exec('ALTER TABLE destinations ADD COLUMN nearest_metro_station TEXT');
  console.log('Added column: nearest_metro_station');
} else {
  console.log('Column nearest_metro_station already exists — skipping');
}

if (!existingColumns.includes('metro_gate')) {
  db.exec('ALTER TABLE destinations ADD COLUMN metro_gate TEXT');
  console.log('Added column: metro_gate');
} else {
  console.log('Column metro_gate already exists — skipping');
}

console.log('\nDone. Run scripts/generate-metro-info.js next to fill these in.');
