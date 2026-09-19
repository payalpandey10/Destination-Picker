// PlaceProfile.jsx
// The "mini local guide" screen from the original spec — famous food
// and famous activities for the one destination that got picked.

export default function PlaceProfile({ profile, loading, onBack, onTryAgain }) {
  if (loading) {
    return (
      <div className="screen">
        <p>Loading the guide...</p>
      </div>
    );
  }

  return (
    <div className="screen profile-screen">
      <button className="btn-link back-link" onClick={onBack}>
        ← Back
      </button>

      <h2>{profile.name}</h2>
      <p className="city-text">{profile.city}</p>
      {profile.short_description && <p className="description">{profile.short_description}</p>}

      <section>
        <h3>Famous food here</h3>
        {profile.famous_food.length === 0 ? (
          <p className="empty-text">No entries yet for this place.</p>
        ) : (
          <ul className="famous-list">
            {profile.famous_food.map((f) => (
              <li key={f.id}>
                <strong>{f.name}</strong>
                <span>{f.note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Famous things to do here</h3>
        {profile.famous_activities.length === 0 ? (
          <p className="empty-text">No entries yet for this place.</p>
        ) : (
          <ul className="famous-list">
            {profile.famous_activities.map((a) => (
              <li key={a.id}>
                <strong>{a.name}</strong>
                <span>{a.note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button className="btn-secondary" onClick={onTryAgain}>
        Try a different place
      </button>
    </div>
  );
}
