// view-food.js — quick way to inspect what's in the database
// Run: node --experimental-sqlite scripts/view-food.js

const db = require('../src/db');

const rows = db
  .prepare(
    `SELECT d.name AS place, f.name, f.note
     FROM famous_food f
     JOIN destinations d ON d.id = f.destination_id
     ORDER BY d.name`
  )
  .all();

console.log(JSON.stringify(rows, null, 2));