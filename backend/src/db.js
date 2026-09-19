// Using Node's BUILT-IN sqlite module instead of the better-sqlite3
// npm package — this avoids native C++ compilation entirely, which
// was failing on Windows without Visual Studio build tools installed.
// Needs Node 22.5+ (you have this). API is nearly identical.
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// The actual database file lives here. It's just a file — you can
// literally delete it and re-run `npm run init-db` to start fresh.
const DB_PATH = path.join(__dirname, '..', 'tubata.db');

const raw = new DatabaseSync(DB_PATH);

// Enforce foreign key constraints (SQLite has them off by default!)
raw.exec('PRAGMA foreign_keys = ON');

// node:sqlite's API differs slightly from better-sqlite3 in one way:
// prepared statements don't auto-cache, and there's no top-level
// db.exec for running MANY statements separated by semicolons the
// way better-sqlite3 allows. This thin wrapper keeps the rest of our
// code (server.js, scripts/*) exactly the same either way.
const db = {
  exec: (sql) => raw.exec(sql),
  prepare: (sql) => {
    const stmt = raw.prepare(sql);
    return {
      run: (...args) => stmt.run(...args),
      get: (...args) => stmt.get(...args),
      all: (...args) => stmt.all(...args),
    };
  },
  transaction: (fn) => {
    return (...args) => {
      raw.exec('BEGIN');
      try {
        const result = fn(...args);
        raw.exec('COMMIT');
        return result;
      } catch (err) {
        raw.exec('ROLLBACK');
        throw err;
      }
    };
  },
};

function initSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema); // exec() can run multiple ; separated statements — run() can't
  console.log('Schema loaded into', DB_PATH);
}

// Only runs when you call `node src/db.js` directly, not when other
// files require() this module — standard Node pattern worth knowing.
if (require.main === module) {
  initSchema();
}

module.exports = db;
