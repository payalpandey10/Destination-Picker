
//
// For every destination that doesn't have famous_food/activities yet,
// this asks Groq (free, fast open-model API) to:
//   Step 1: brainstorm candidates (noisy, casts a wide net)
//   Step 2: filter that list down to the most SPECIFIC, non-generic
//           entries and write clean one-line notes for each
//
// Run:  npm run generate
// Needs: GROQ_API_KEY in your .env file (free, instant signup —
//        get one at https://console.groq.com/keys)
//
// Note: Groq's free tier doesn't include live web search, so this
// relies on the model's own knowledge instead of fresh search results.
// Fine for well-known places (Chandni Chowk, Khan Market etc.), thinner
// for obscure/new ones — which is exactly why every entry still gets
// reviewed by hand before being treated as final (see bottom of file).
 
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
    // Free tier hits a tokens-per-minute ceiling fast. Groq tells us
    // roughly how long to wait in the error body — we just wait a safe
    // fixed amount and retry, rather than parsing their message text.
    console.log('    (rate limited, waiting 20s before retrying...)');
    await sleep(20000);
    return callGroq(prompt, retries - 1);
  }
 
  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  }
 
  const data = await res.json();
  // Groq is OpenAI-compatible: text lives at choices[0].message.content
  return data.choices[0].message.content;
}
 
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
 
// ---------- STEP 1: brainstorm (noisy, wide net) ----------
async function brainstorm(destName, city, category) {
  const prompt = `You know about "${destName}", a ${category} in ${city}, India.
 
Based on what you know, list:
- 8-10 candidate food items, dishes, or specific food stalls/shops that
  are commonly known as things this place is famous for
- 6-8 candidate activities, landmarks, or experiences specific to this place
 
Be exhaustive and don't filter yet — just list everything that seems
relevant, even if some entries turn out to be generic. Include stall/shop
names where you know them. Plain list format, no JSON yet. If you are
unsure about a specific fact, say so rather than inventing one.`;
 
  return callGroq(prompt);
}
 
// ---------- STEP 2: filter + structure ----------
async function refine(destName, city, rawBrainstorm) {
  const prompt = `Here is a raw brainstormed list of food and activities for
"${destName}" in ${city}:
 
${rawBrainstorm}
 
From this list, pick:
- The 4 food entries that are MOST SPECIFIC to this exact place (not
  generic "street food" or "good restaurants" — prefer named dishes or
  named stalls that this place is distinctly known for)
- The 4 activities that are MOST SPECIFIC to this exact place
 
CRITICAL RULE ON NAMES: only use a specific vendor/stall/shop name if you
are genuinely confident it is real and correctly associated with this
exact place — not a plausible-sounding name you are inferring from the
type of place this is. If you are not confident a specific named vendor
exists here, describe the food itself instead of inventing a shop name
to sound specific (e.g. write "Chaat stalls near the main entrance" or
"Momos from vendors along the food court", not a made-up brand name). A
true, honest category beats a fabricated specific name — fabricating a
name that doesn't exist is a serious failure we are actively avoiding.
 
Drop anything marked as uncertain in the list above. For each remaining
entry, write a one-line note (max 20 words) in your own words explaining
what makes it notable or distinctive — not just "it's popular here."
 
Respond with ONLY valid JSON, no markdown fences, no preamble, in this
exact shape:
{
  "short_description": "one sentence describing the place itself",
  "famous_food": [{"name": "...", "note": "..."}],
  "famous_activities": [{"name": "...", "note": "..."}]
}`;
 
  const text = await callGroq(prompt);
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
 
// ---------- Main loop ----------
async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('Missing GROQ_API_KEY in .env — see .env.example');
    process.exit(1);
  }
 
  // Only process destinations that don't already have food entries —
  // makes this script safe to re-run as you add new places.
  const destinations = db
    .prepare(
      `SELECT d.* FROM destinations d
       LEFT JOIN famous_food f ON f.destination_id = d.id
       WHERE f.id IS NULL`
    )
    .all();
 
  console.log(`${destinations.length} destination(s) need content generated.\n`);
 
  const insertFood = db.prepare(
    'INSERT INTO famous_food (destination_id, name, note) VALUES (?, ?, ?)'
  );
  const insertActivity = db.prepare(
    'INSERT INTO famous_activities (destination_id, name, note) VALUES (?, ?, ?)'
  );
  const updateDesc = db.prepare(
    'UPDATE destinations SET short_description = ? WHERE id = ?'
  );
 
  for (const dest of destinations) {
    console.log(`Generating for "${dest.name}"...`);
    try {
      const raw = await brainstorm(dest.name, dest.city, dest.category);
      const result = await refine(dest.name, dest.city, raw);
 
      const insertMany = db.transaction(() => {
        updateDesc.run(result.short_description, dest.id);
        for (const f of result.famous_food) {
          insertFood.run(dest.id, f.name, f.note);
        }
        for (const a of result.famous_activities) {
          insertActivity.run(dest.id, a.name, a.note);
        }
      });
      insertMany();
 
      console.log(`  ✓ ${result.famous_food.length} food + ${result.famous_activities.length} activity entries saved\n`);
    } catch (err) {
      // One bad destination shouldn't kill the whole batch — log and continue
      console.error(`  ✗ Failed for "${dest.name}": ${err.message}\n`);
    }
 
    // Proactive pause between destinations to stay under the free
    // tier's tokens-per-minute limit, instead of just reacting to 429s.
    await sleep(15000);
  }
 
  console.log('Done. Review the entries before treating them as final —');
  console.log('this is a first draft, not a finished product. See README note.');
}
 
main();