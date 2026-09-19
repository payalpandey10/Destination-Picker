// api.js — every call to our backend lives here, in one place.
// If the backend's URL or shape ever changes, this is the only
// file that needs updating — the components below don't care.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function getRandomDestination({ vibe, budget, city, excludeIds, lat, long, maxDistance }) {
  const params = new URLSearchParams();
  if (vibe) params.set('vibe', vibe);
  if (budget) params.set('budget', budget);
  if (city) params.set('city', city);
  if (excludeIds && excludeIds.length) params.set('exclude', excludeIds.join(','));
  if (lat != null && long != null) {
    params.set('lat', lat);
    params.set('long', long);
    if (maxDistance) params.set('maxDistance', maxDistance);
  }

  const res = await fetch(`${API_BASE}/api/destinations/random?${params}`);

  if (res.status === 404) {
    // Not a crash — just means no places match these filters.
    // The component decides how to show this to the user.
    return null;
  }
  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }
  return res.json();
}

export async function getDestinationProfile(id) {
  const res = await fetch(`${API_BASE}/api/destinations/${id}`);
  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }
  return res.json();
}