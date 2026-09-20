// import-data.js — rebuilds the database from data/seed-data.json.
// Safe to run every time the server starts: it clears existing rows
// first, so re-running never creates duplicates. This is what makes
// deployment on free hosting (which wipes local files on restart)
// safe — every restart just reconstructs the same known-good data.
//
// Run: node --experimental-sqlite scripts/import-data.js

const fs = require('fs');
const path = require('path');
const db = require('../src/db');

const dataPath = path.join(__dirname, '..', 'data', 'seed-data.json');

if (!fs.existsSync(dataPath)) {
  console.log('No data/seed-data.json found — nothing to import. Run export-data.js first.');
  process.exit(0);
}

const { destinations, famousFood, famousActivities } = JSON.parse(
  fs.readFileSync(dataPath, 'utf8')
);

const insertDestination = db.prepare(`
  INSERT INTO destinations
    (id, name, city, category, lat, long, short_description, vibe_tags, budget_level, nearest_metro_station, metro_gate, created_at)
  VALUES (@id, @name, @city, @category, @lat, @long, @short_description, @vibe_tags, @budget_level, @nearest_metro_station, @metro_gate, @created_at)
`);

const insertFood = db.prepare(`
  INSERT INTO famous_food (id, destination_id, name, note, photo_url)
  VALUES (@id, @destination_id, @name, @note, @photo_url)
`);

const insertActivity = db.prepare(`
  INSERT INTO famous_activities (id, destination_id, name, note, photo_url)
  VALUES (@id, @destination_id, @name, @note, @photo_url)
`);

const rebuild = db.transaction(() => {
  db.exec('DELETE FROM famous_activities');
  db.exec('DELETE FROM famous_food');
  db.exec('DELETE FROM destinations');

  for (const d of destinations) insertDestination.run(d);
  for (const f of famousFood) insertFood.run(f);
  for (const a of famousActivities) insertActivity.run(a);
});

rebuild();

console.log(`Imported ${destinations.length} destinations, ${famousFood.length} food entries, ${famousActivities.length} activity entries`);