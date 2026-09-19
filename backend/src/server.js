require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// Haversine formula — calculates real-world distance in km between
// two lat/long points on Earth's surface. Pure math, no AI needed —
// this is a geometry problem, not a language problem.
// ------------------------------------------------------------------
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ------------------------------------------------------------------
// GET /api/destinations/random?vibe=chill&budget=low&lat=..&long=..&maxDistance=10
// The core "one tap, one destination" endpoint. This IS the app's
// main feature — everything else is supporting cast.
// ------------------------------------------------------------------
app.get('/api/destinations/random', (req, res) => {
  const { vibe, budget, city, exclude, lat, long, maxDistance } = req.query;
  // exclude = comma-separated ids already shown this session, so
  // "try again" doesn't repeat the same place (see note below)

  let query = 'SELECT * FROM destinations WHERE 1=1';
  const params = [];

  // If the person shared their real location, distance matters more
  // than a city name match — Delhi has 20km-wide sprawl, "same city"
  // doesn't mean "nearby." Only fall back to city filtering when we
  // don't have coordinates to work with.
  const hasCoords = lat && long;
  if (city && !hasCoords) {
    query += ' AND city = ?';
    params.push(city);
  }
  if (budget) {
    query += ' AND budget_level = ?';
    params.push(budget);
  }
  if (vibe) {
    // vibe_tags is stored as "chill,foodie" — LIKE match is good
    // enough at this scale, no need for a real tags table (see schema notes)
    query += ' AND vibe_tags LIKE ?';
    params.push(`%${vibe}%`);
  }
  if (exclude) {
    const excludeIds = exclude.split(',').map(Number).filter(Boolean);
    if (excludeIds.length) {
      query += ` AND id NOT IN (${excludeIds.map(() => '?').join(',')})`;
      params.push(...excludeIds);
    }
  }

  let candidates = db.prepare(query).all(...params);

  // Distance filtering happens in JS, not SQL — Haversine isn't a
  // native SQLite function, and with only dozens of rows there's no
  // performance reason to push this into the database.
  if (hasCoords) {
    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);
    const maxKm = maxDistance ? parseFloat(maxDistance) : 15; // sensible default radius

    candidates = candidates
      .filter((d) => d.lat != null && d.long != null)
      .map((d) => ({
        ...d,
        distance_km: Math.round(haversineDistanceKm(userLat, userLong, d.lat, d.long) * 10) / 10,
      }))
      .filter((d) => d.distance_km <= maxKm);
  }

  if (candidates.length === 0) {
    return res.status(404).json({
      error: 'No destinations match those filters. Try loosening them.',
    });
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  res.json(pick);
});

// ------------------------------------------------------------------
// GET /api/destinations/:id  → full profile: place + food + activities
// This powers the "place profile" screen.
// ------------------------------------------------------------------
app.get('/api/destinations/:id', (req, res) => {
  const destination = db
    .prepare('SELECT * FROM destinations WHERE id = ?')
    .get(req.params.id);

  if (!destination) {
    return res.status(404).json({ error: 'Destination not found' });
  }

  const food = db
    .prepare('SELECT id, name, note, photo_url FROM famous_food WHERE destination_id = ?')
    .all(req.params.id);

  const activities = db
    .prepare('SELECT id, name, note, photo_url FROM famous_activities WHERE destination_id = ?')
    .all(req.params.id);

  res.json({ ...destination, famous_food: food, famous_activities: activities });
});

// ------------------------------------------------------------------
// GET /api/destinations  → list all (useful for admin/debugging, not
// shown to end users — the whole point is we DON'T show a list)
// ------------------------------------------------------------------
app.get('/api/destinations', (req, res) => {
  const rows = db.prepare('SELECT id, name, city, category, vibe_tags, budget_level FROM destinations').all();
  res.json(rows);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`tu-bata backend running on http://localhost:${PORT}`));