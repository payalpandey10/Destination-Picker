// ResultCard.jsx
// Shown right after the "one tap" pick. This is the moment the app is
// built around — one destination, no list, no scrolling.

// Each category gets its own sticker color, like different badge
// colors in a real travel-sticker collection.
const CATEGORY_COLORS = {
  market: 'chili',
  street: 'chili',
  park: 'leaf',
  lake: 'leaf',
  heritage_site: 'marigold',
  neighborhood: 'plum',
  mall: 'plum',
};

export default function ResultCard({ destination, onTryAgain, onSeeGuide, onStartOver }) {
  const badgeColor = CATEGORY_COLORS[destination.category] || 'chili';

  return (
    <div className="screen result-screen">
      <span className={`category-badge badge-${badgeColor}`}>
        {destination.category.replace(/_/g, ' ')}
      </span>
      <h2>{destination.name}</h2>
      <p className="city-text">{destination.city}</p>

      {destination.short_description && (
        <p className="description">{destination.short_description}</p>
      )}

      <div className="tag-row">
        {destination.vibe_tags &&
          destination.vibe_tags.split(',').map((tag) => (
            <span key={tag} className="tag">{tag.trim()}</span>
          ))}
        <span className="tag tag-budget">{destination.budget_level} budget</span>
        {destination.distance_km != null && (
          <span className="tag tag-distance">{destination.distance_km} km away</span>
        )}
      </div>

      <button className="btn-primary" onClick={onSeeGuide}>
        See what's famous here
      </button>

      <button className="btn-secondary" onClick={onTryAgain}>
        Try again
      </button>

      <button className="btn-link" onClick={onStartOver}>
        Change filters
      </button>
    </div>
  );
}