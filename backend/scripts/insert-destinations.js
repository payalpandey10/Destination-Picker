const db = require('../src/db');
const destinations = require('./seed-list');

const insert = db.prepare(`
  INSERT INTO destinations (name, city, category, lat, long, budget_level, vibe_tags, short_description)
  VALUES (@name, @city, @category, @lat, @long, @budget_level, @vibe_tags, '')
`);

let count = 0;
for (const d of destinations) {
  // Skip if a destination with this name already exists — makes the
  // script safe to re-run after you add new places to seed-list.js
  const exists = db.prepare('SELECT id FROM destinations WHERE name = ?').get(d.name);
  if (exists) {
    console.log(`Skipping "${d.name}" — already in DB (id ${exists.id})`);
    continue;
  }
  const info = insert.run(d);
  console.log(`Inserted "${d.name}" as id ${info.lastInsertRowid}`);
  count++;
}

console.log(`\nDone. ${count} new destinations inserted.`);
