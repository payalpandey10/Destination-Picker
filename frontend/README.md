# tu-bata — frontend

React + Vite app. Talks to the `backend` folder's API — the backend
must be running for this to show real data.

## Folder structure

```
frontend/
├── src/
│   ├── api.js              → every backend API call lives here
│   ├── App.jsx              → screen state machine (filters → result → profile)
│   ├── App.css               → all styling
│   └── components/
│       ├── FilterScreen.jsx  → vibe/budget picker, "pick a place" button
│       ├── ResultCard.jsx    → the single destination shown after picking
│       └── PlaceProfile.jsx  → "famous food/activities" guide page
├── .env.example              → copy to .env, points at the backend URL
└── package.json
```

## Setup (run once)

**The backend must already be set up and runnable** (see `../backend/README.md`)
before this is useful — this app has no data of its own.

```bash
cd frontend
npm install
cp .env.example .env
```

## Running it

You need **two terminals running at the same time**:

**Terminal 1 — backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## How the pieces fit together

1. `FilterScreen` lets you pick a vibe/budget, then calls
   `getRandomDestination()` from `api.js`
2. That hits the backend's `/api/destinations/random` endpoint
3. The result shows in `ResultCard` — "Try again" re-rolls (excluding
   places already shown this session), "See what's famous here" moves
   to the profile screen
4. `PlaceProfile` calls `getDestinationProfile()`, which hits
   `/api/destinations/:id` and shows the food + activity guide

## Where we are / what's next

- [x] Step 1-3: Backend + AI content generation (see `../backend/README.md`)
- [x] Step 4: Frontend — filter screen, result card, place profile page
- [ ] Step 5: Location-based distance filtering (GPS instead of just vibe/budget)
- [ ] Step 6: Two-person shared session mode
- [ ] Map integration
