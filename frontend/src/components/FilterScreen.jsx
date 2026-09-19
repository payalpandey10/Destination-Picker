// FilterScreen.jsx
// The very first screen. Deliberately minimal — the whole point of the
// app is "don't make me think," so we're not building a big form here.

const VIBES = ['chill', 'lively', 'foodie', 'outdoorsy'];
const BUDGETS = ['low', 'medium', 'high'];
// null means "anywhere" — no distance limit, no location needed at all
const DISTANCES = [
  { label: 'Anywhere', value: null },
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 25 km', value: 25 },
];

// Small hand-drawn-feeling stroke icons, kept minimal and consistent.
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
  </svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <circle cx="16" cy="14" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const DiceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export default function FilterScreen({ filters, onChange, onPickPlace, onSurpriseMe, error, locatingUser }) {
  return (
    <div className="screen filter-screen">
      <h1>Tu Bata</h1>
      <p className="subtitle">Where do you want to go? Pick a vibe, a budget, or a distance — we'll handle the rest.</p>

      <div className="filter-group">
        <span className="filter-group-label"><SparkleIcon /> Vibe</span>
        <div className="pill-row">
          {VIBES.map((v) => (
            <button
              key={v}
              className={`pill ${filters.vibe === v ? 'pill-active' : ''}`}
              onClick={() => onChange({ ...filters, vibe: filters.vibe === v ? null : v })}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label"><WalletIcon /> Budget</span>
        <div className="pill-row">
          {BUDGETS.map((b) => (
            <button
              key={b}
              className={`pill ${filters.budget === b ? 'pill-active' : ''}`}
              onClick={() => onChange({ ...filters, budget: filters.budget === b ? null : b })}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label"><PinIcon /> Distance</span>
        <div className="pill-row">
          {DISTANCES.map((d) => (
            <button
              key={d.label}
              className={`pill ${filters.maxDistance === d.value ? 'pill-active' : ''}`}
              onClick={() => onChange({ ...filters, maxDistance: d.value })}
            >
              {d.label}
            </button>
          ))}
        </div>
        {locatingUser && <p className="hint-text">Getting your location...</p>}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn-primary" onClick={onPickPlace}>
        Pick a place for me <ArrowIcon />
      </button>

      <button className="btn-secondary" onClick={onSurpriseMe}>
        Surprise me (skip filters) <DiceIcon />
      </button>
    </div>
  );
}