# tu-bata — backend

"Tu Bata" destination picker + local guide. This is the backend only —
no frontend yet (that's Step 4).

## Folder structure

```
backend/
├── src/
│   ├── schema.sql      → defines the 3 database tables
│   ├── db.js            → connects to SQLite, loads the schema
│   └── server.js        → Express API (the actual server)
├── scripts/
│   ├── seed-list.js         → hand-picked list of place names to add
│   ├── insert-destinations.js → puts seed-list.js into the database
│   └── generate-content.js   → uses Claude AI to write the "famous
│                                 for" food/activity content for each
│                                 destination that doesn't have it yet
├── package.json
└── .env.example          → copy this to .env and fill in your key
```

## Setup (run these in order, once)

**If you already ran `npm install` before and it failed**, delete the
`node_modules` folder first (it may be half-installed) before continuing:
```bash
rmdir /s /q node_modules      # Windows
# or: rm -rf node_modules     # Mac/Linux
```

```bash
cd backend
npm install
cp .env.example .env          # then edit .env and add your GROQ_API_KEY
                               # (free, instant signup: https://console.groq.com/keys)
npm run init-db               # creates tubata.db with empty tables
npm run seed                  # adds the 10 seed places
npm run generate              # AI-generates food/activity content
```

Note: we use Node's **built-in** SQLite (`node:sqlite`) instead of the
`better-sqlite3` package, so there's no native C++ compilation step —
no Visual Studio / build tools needed on Windows. You do need Node
22.5 or newer. Check with `node --version`. You'll see an
"ExperimentalWarning: SQLite is an experimental feature" message every
time you run a script — that's expected and harmless, just Node being
cautious about a newer feature.

## Running the server day-to-day

```bash
npm run dev
```

Server runs on `http://localhost:4000`. Try these in your browser:

- `http://localhost:4000/api/destinations` — list everything in the DB
- `http://localhost:4000/api/destinations/random?vibe=foodie` — the core
  "one tap, one place" feature
- `http://localhost:4000/api/destinations/1` — full profile (place +
  food + activities) for destination id 1

## Adding more places later

1. Add an entry to `scripts/seed-list.js`
2. Re-run `node scripts/insert-destinations.js` (safe — skips duplicates)
3. Re-run `node scripts/generate-content.js` (safe — only generates for
   places that don't have content yet)

## Where we are / what's next

- [x] Step 1: Project setup
- [x] Step 2: Database schema + core API endpoints
- [x] Step 3: AI-assisted content generation pipeline
- [ ] Step 4: Frontend (filter screen, result card, place profile page)
- [ ] Step 5: Location-based distance filtering (GPS instead of city name)
- [ ] Step 6: Two-person shared session mode

**Important**: AI-generated content in generate-content.js is a first
draft. Skim each destination's entries for anything generic or wrong
before treating it as final — this is meant to save you writing time,
not review time.
