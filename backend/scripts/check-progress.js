// check-progress.js — shows how many destinations have generated
// content vs. how many are still missing it.
// Run: node --experimental-sqlite scripts/check-progress.js

const db = require('../src/db');

const total = db.prepare('SELECT COUNT(*) as c FROM destinations').get().c;
const withFood = db.prepare('SELECT COUNT(DISTINCT destination_id) as c FROM famous_food').get().c;

const missing = db
  .prepare(
    `SELECT d.name FROM destinations d
     LEFT JOIN famous_food f ON f.destination_id = d.id
     WHERE f.id IS NULL`
  )
  .all()
  .map((r) => r.name);

console.log(`Total destinations: ${total}`);
console.log(`Have generated content: ${withFood}`);
console.log(`Still need content: ${missing.length}`);
if (missing.length) {
  console.log('Missing:', missing.join(', '));
}