// clear-entries.js — deletes food/activity entries for specific
// destinations so generate-content.js will redo just those ones.
// Run: node --experimental-sqlite scripts/clear-entries.js

const db = require('../src/db');

// Edit this list any time you want to redo specific destinations.
const namesToClear = [
  'Hauz Khas Village',
  'Lodhi Garden',
  'Dilli Haat',
  "Humayun's Tomb",
  'Sarojini Nagar Market',
  'Kamla Nagar Market',
  'Garden of Five Senses',
];

for (const name of namesToClear) {
  const dest = db.prepare('SELECT id FROM destinations WHERE name = ?').get(name);
  if (!dest) {
    console.log(`Skipping "${name}" — not found in database`);
    continue;
  }
  db.prepare('DELETE FROM famous_food WHERE destination_id = ?').run(dest.id);
  db.prepare('DELETE FROM famous_activities WHERE destination_id = ?').run(dest.id);
  console.log(`Cleared entries for "${name}"`);
}

console.log('\nDone. Run `npm run generate` to regenerate the cleared ones.');