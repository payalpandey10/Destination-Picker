// export-data.js — dumps every destination, food, and activity entry
// into a single JSON file that gets committed to git. This is what
// makes deployment safe: free hosting tiers wipe the local database
// file on restart, but this JSON survives because it's just a normal
// tracked file. The server rebuilds its database from this on startup.
//
// Run this locally whenever you've reviewed/corrected content and
// want to "lock in" the current state for deployment.
// Run: node --experimental-sqlite scripts/export-data.js

const fs = require('fs');
const path = require('path');
const db = require('../src/db');

const destinations = db.prepare('SELECT * FROM destinations').all();
const famousFood = db.prepare('SELECT * FROM famous_food').all();
const famousActivities = db.prepare('SELECT * FROM famous_activities').all();

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const outPath = path.join(dataDir, 'seed-data.json');
fs.writeFileSync(
  outPath,
  JSON.stringify({ destinations, famousFood, famousActivities }, null, 2)
);

console.log(`Exported ${destinations.length} destinations, ${famousFood.length} food entries, ${famousActivities.length} activity entries`);
console.log(`Saved to ${outPath}`);
console.log('\nCommit this file to git — it\'s what the deployed server uses.');