import { useState } from 'react';
import { getRandomDestination, getDestinationProfile } from './api';
import FilterScreen from './components/FilterScreen';
import ResultCard from './components/ResultCard';
import PlaceProfile from './components/PlaceProfile';
import DrawingTicket from './components/DrawingTicket';
import BackgroundDecor from './components/BackgroundDecor';
import './App.css';

// The app only ever has 3 screens. Keeping this as one string instead
// of separate booleans (isShowingFilters, isShowingResult, ...) makes
// it impossible to accidentally be "on" two screens at once.
const SCREENS = {
  FILTERS: 'filters',
  DRAWING: 'drawing',
  RESULT: 'result',
  PROFILE: 'profile',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.FILTERS);
  const [filters, setFilters] = useState({ vibe: null, budget: null, maxDistance: null });
  const [destination, setDestination] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null); // { lat, long } once granted
  const [locatingUser, setLocatingUser] = useState(false);

  // Every destination id we've already shown this session, so "try
  // again" doesn't repeat the same place — this was flagged as a
  // must-have all the way back when we designed the API.
  const [shownIds, setShownIds] = useState([]);

  // Wraps the browser's geolocation API in a Promise so we can just
  // `await` it. Only called when the person actually picks a distance
  // filter — never on page load, since asking for location before
  // someone's opted into a location-based feature feels invasive.
  function getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Your browser does not support location.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
        () => reject(new Error('Location permission was denied.')),
        { timeout: 8000 }
      );
    });
  }

  async function pickDestination(overrideFilters = filters) {
    setError(null);
    const returnScreen = screen === SCREENS.FILTERS ? SCREENS.FILTERS : SCREENS.RESULT;

    // Only bother with location at all if a distance filter is active.
    let coords = location;
    if (overrideFilters.maxDistance && !coords) {
      setLocatingUser(true);
      try {
        coords = await getBrowserLocation();
        setLocation(coords);
      } catch (err) {
        setLocatingUser(false);
        setError(`${err.message} Try allowing location access, or pick "Anywhere" instead.`);
        return;
      }
      setLocatingUser(false);
    }

    // The actual "drawing your ticket" moment — even if the API answers
    // in 20ms, we hold this screen for a bit so the pick feels like an
    // event, not an instant swap. Motion here directly answers the tap
    // that triggered it, which is exactly when motion earns its keep.
    setScreen(SCREENS.DRAWING);

    try {
      const [result] = await Promise.all([
        getRandomDestination({
          vibe: overrideFilters.vibe,
          budget: overrideFilters.budget,
          excludeIds: shownIds,
          lat: overrideFilters.maxDistance ? coords?.lat : undefined,
          long: overrideFilters.maxDistance ? coords?.long : undefined,
          maxDistance: overrideFilters.maxDistance,
        }),
        sleep(650),
      ]);

      if (!result) {
        setError('No places left matching those filters — try changing them, or hit Surprise Me.');
        setScreen(returnScreen);
        return;
      }

      setDestination(result);
      setShownIds((prev) => [...prev, result.id]);
      setScreen(SCREENS.RESULT);
    } catch (err) {
      setError('Could not reach the server. Is the backend running?');
      setScreen(returnScreen);
    }
  }

  function handleSurpriseMe() {
    // "Skip filters" should mean skip vibe/budget preferences — not
    // ignore a distance limit you deliberately chose. Nobody wants
    // "surprise me, possibly 40km away."
    pickDestination({ vibe: null, budget: null, maxDistance: filters.maxDistance });
  }

  async function handleSeeGuide() {
    setScreen(SCREENS.PROFILE);
    setProfileLoading(true);
    try {
      const data = await getDestinationProfile(destination.id);
      setProfile(data);
    } catch (err) {
      setError('Could not load the guide for this place.');
    } finally {
      setProfileLoading(false);
    }
  }

  function handleStartOver() {
    setScreen(SCREENS.FILTERS);
    setFilters({ vibe: null, budget: null, maxDistance: null });
    setShownIds([]); // fresh filters = fresh memory of what's been shown
  }

  return (
    <div className="app-shell">
      <BackgroundDecor />

      {screen === SCREENS.FILTERS && (
        <FilterScreen
          filters={filters}
          onChange={setFilters}
          onPickPlace={() => pickDestination()}
          onSurpriseMe={handleSurpriseMe}
          error={error}
          locatingUser={locatingUser}
        />
      )}

      {screen === SCREENS.DRAWING && <DrawingTicket />}

      {screen === SCREENS.RESULT && destination && (
        <ResultCard
          destination={destination}
          onTryAgain={() => pickDestination()}
          onSeeGuide={handleSeeGuide}
          onStartOver={handleStartOver}
        />
      )}

      {screen === SCREENS.PROFILE && (
        <PlaceProfile
          profile={profile}
          loading={profileLoading}
          onBack={() => setScreen(SCREENS.RESULT)}
          onTryAgain={() => pickDestination()}
        />
      )}
    </div>
  );
}