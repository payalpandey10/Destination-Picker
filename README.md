# Tu Bata 🎟️

**Stop arguing about where to go.** Tu Bata picks a destination for you — one tap,
no scrolling, no "nahi tu bata" loop — and then acts as a mini local guide for
that place: what's actually famous to eat there, and what's worth doing.

Built for Delhi, with real destinations across markets, parks, heritage
sites, and neighborhoods.

## The problem

Two people want to hang out. Neither wants to be "the one who picked" —
*"chal kahi ghumte hai" → "kaha chale" → "tu bata" → "nahi tu bata" → plan
cancelled.* Even when a place does get picked, most people don't know what's
actually worth eating or doing there.

## What it does

- **Pick a place for me** — one tap, filtered by vibe (chill / lively / foodie
  / outdoorsy), budget, and real GPS distance
- **Try again** — re-rolls without repeating a place you've already seen
- **Surprise me** — skips vibe/budget entirely, still respects your distance limit
- Once a place is picked, see **famous food** and **famous things to do** there
  specifically — not a generic nearby-restaurants list
- **Nearest metro station** for each place, with an honest "check signage on
  arrival" fallback instead of a guessed gate number

## Tech stack

- **Frontend:** React + Vite, plain CSS (no framework), Google Fonts (Caveat, Fraunces, Space Grotesk)
- **Backend:** Node.js + Express, SQLite (via Node's built-in `node:sqlite`, no native compilation needed)
- **Content generation:** Groq API (free tier) — a two-step AI pipeline that
  brainstorms candidates then filters down to specific, verifiable entries,
  followed by human review
- **Location:** Browser Geolocation API + the Haversine formula for real
  distance filtering — plain math, no AI needed for this part

## Project structure

```
tu-bata/
├── backend/     → API server + database + content generation scripts
│   └── README.md  → full backend setup instructions
└── frontend/    → React app (the actual UI)
    └── README.md  → full frontend setup instructions
```

## Quick start

You need both running at once, in two terminals:

```bash
# Terminal 1
cd backend
npm install
cp .env.example .env   # add your free Groq API key: console.groq.com/keys
npm run init-db
npm run seed
npm run generate        # AI-generates food/activity content (takes a few minutes)
npm run dev              # starts the API on :4000
```

```bash
# Terminal 2
cd frontend
npm install
cp .env.example .env
npm run dev               # starts the app on :5173
```

Full details, including how content generation and review work, are in
[`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).

## A note on the content

Food and activity entries are AI-drafted, then human-reviewed — not scraped
from any single source. The generation prompt explicitly instructs the model
to describe a food category honestly (e.g. "chaat stalls near the entrance")
rather than invent a specific vendor name it isn't genuinely confident is
real. This catches most fabrication, but not all of it — every entry should
still be spot-checked before being treated as final. See the "Where the
content comes from" section in `backend/README.md` for the full pipeline.

Background and sticker photos are the project owner's own sourced images
(from free-license sites), not scraped from search results.

## Status

- [x] Destination picker with vibe/budget/distance filters
- [x] AI-generated, human-reviewed "famous for" content
- [x] Real GPS-based distance filtering
- [x] Nearest metro station info
- [x] A growing set of Delhi destinations across markets, parks, heritage sites, lakes, streets
- [ ] Two-person shared session (both people see the same pick at once)
- [ ] Deployment to a public URL
- [ ] Expansion beyond Delhi

## Why this is different from "random restaurant picker" apps

Apps like Restaurant Roulette or Lunch Wheel spin a wheel for a random nearby
restaurant. Tu Bata combines destination + food + activities into one flow,
gives place-specific curated context instead of generic rating-sorted lists,
and is built around Indian street food and market culture rather than a
generic Western restaurant-filter UI.