// generate-metro-info.js
//
// Fills in nearest_metro_station and metro_gate for destinations that
// don't have it yet. Separate from generate-content.js on purpose —
// this backfills existing destinations without re-generating their
// (already reviewed) food/activity content.
//
// IMPORTANT: gate numbers are precise, easily-wrong facts. A wrong
// gate number actively sends someone the wrong direction — worse than
// a vague food description. The prompt below is deliberately strict
// about admitting uncertainty. Review this field carefully — arguably
// more carefully than the food/activity content, since being wrong
// here has a real-world cost, not just a quality one.
//
// Run: node --experimental-sqlite scripts/generate-metro-info.js
// Needs: GROQ_API_KEY in your .env file

require('dotenv').config();
const db = require('../src/db');

const MODEL = 'openai/gpt-oss-120b';

async function callGroq(prompt, retries = 3) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (res.status === 429 && retries > 0) {
    console.log('    (rate limited, waiting 20s before retrying...)');
    await sleep(20000);
    return callGroq(prompt, retries - 1);
  }

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getMetroInfo(destName, city) {
  const prompt = `What is the nearest Delhi Metro station to "${destName}" in ${city}, India?

If you also know which gate/exit number is commonly used to reach this
specific place from that station, include it. Delhi Metro gate numbers
are precise facts that are easy to get wrong, and a wrong gate number
actively misleads someone trying to get there — this matters more than
sounding complete. Only state a gate number if you are genuinely
confident about it. If you know the station but not a specific gate,
say "check signage on arrival" instead of guessing a number. If you
are not confident about the station itself either, say so honestly.

Respond with ONLY valid JSON, no markdown fences, no preamble:
{
  "nearest_metro_station": "station name, or null if genuinely unsure",
  "metro_gate": "gate number, or 'check signage on arrival' if unsure"
}`;

  const text = await callGroq(prompt);
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('Missing GROQ_API_KEY in .env — see .env.example');
    process.exit(1);
  }

  const destinations = db
    .prepare('SELECT * FROM destinations WHERE nearest_metro_station IS NULL')
    .all();

  console.log(`${destinations.length} destination(s) need metro info.\n`);

  const update = db.prepare(
    'UPDATE destinations SET nearest_metro_station = ?, metro_gate = ? WHERE id = ?'
  );

  for (const dest of destinations) {
    console.log(`Looking up "${dest.name}"...`);
    try {
      const info = await getMetroInfo(dest.name, dest.city);
      update.run(info.nearest_metro_station, info.metro_gate, dest.id);
      console.log(`  ✓ ${info.nearest_metro_station || 'unknown'} — ${info.metro_gate}\n`);
    } catch (err) {
      console.error(`  ✗ Failed for "${dest.name}": ${err.message}\n`);
    }

    // Same pacing as generate-content.js — stay under the free tier's
    // tokens-per-minute limit.
    await sleep(10000);
  }

  console.log('Done. This field carries real navigational risk if wrong —');
  console.log('review every entry, not just a sample, before trusting it.');
}

main();
