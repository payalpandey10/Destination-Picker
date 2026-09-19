// correct-entries.js — fixes specific entries found to be wrong during
// manual review (e.g. AI invented a name that doesn't actually exist).
// Add new corrections to the array below any time you catch one.
// Run: node --experimental-sqlite scripts/correct-entries.js

const db = require('../src/db');

const corrections = [
  {
    destination: "Humayun's Tomb",
    oldName: 'Baba Biryani (Nizamuddin lane)',
    newName: 'Muradabadi Shahi Biryani, Nizamuddin',
    newNote: 'Well-known biryani spot in the Nizamuddin lanes, a short walk from the tomb, known for its Mughlai-style chicken biryani.',
  },
  {
    destination: 'Dilli Haat',
    oldName: 'Madhuban Mithai & Snacks',
    newName: 'Regional mithai stalls',
    newNote: 'Different Indian states run rotating food stalls here, several offering fresh regional sweets like barfi and peda.',
  },
];

for (const c of corrections) {
  const dest = db.prepare('SELECT id FROM destinations WHERE name = ?').get(c.destination);
  if (!dest) {
    console.log(`Skipping — destination "${c.destination}" not found`);
    continue;
  }
  const result = db
    .prepare('UPDATE famous_food SET name = ?, note = ? WHERE destination_id = ? AND name = ?')
    .run(c.newName, c.newNote, dest.id, c.oldName);

  if (result.changes === 0) {
    console.log(`No match found for "${c.oldName}" under "${c.destination}" — maybe already fixed?`);
  } else {
    console.log(`Fixed "${c.oldName}" → "${c.newName}" (${c.destination})`);
  }
}

console.log('\nDone.');