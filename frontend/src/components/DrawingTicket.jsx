// DrawingTicket.jsx
// The "something is happening" moment between tapping the button and
// seeing a result. Cycles through category words like a raffle drum
// spinning, ties directly into the ticket-stub visual language.

import { useEffect, useState } from 'react';

const CATEGORIES = ['Market', 'Park', 'Heritage site', 'Street', 'Neighborhood', 'Lake'];

export default function DrawingTicket() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % CATEGORIES.length);
    }, 90);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="screen drawing-screen">
      <div className="drawing-ticket-icon">🎟️</div>
      <p className="drawing-label">Drawing your ticket...</p>
      <p className="drawing-cycle">{CATEGORIES[index]}</p>
    </div>
  );
}