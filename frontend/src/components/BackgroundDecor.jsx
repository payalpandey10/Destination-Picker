// BackgroundDecor.jsx
// Real Delhi photos as scattered polaroid snapshots, like photos
// tucked around a travel scrapbook page. Rendered once outside the
// screen-switching logic so it never re-animates between screens.

const POLAROIDS = [
  { src: '/stickers/red-fort.jpg', size: 130, top: '6%', left: '4%', rotate: -8 },
  { src: '/stickers/lodhi-tomb.jpg', size: 110, bottom: '8%', left: '5%', rotate: 6 },
  { src: '/stickers/kite.jpg', size: 120, top: '5%', right: '4%', rotate: 7 },
  { src: '/stickers/food-chaat.jpg', size: 115, bottom: '9%', right: '4%', rotate: -6 },
];

const CAPTIONS = [
  { text: 'New places', top: '19%', left: '2%', rotate: -4 },
  { text: 'Good food', top: '19%', right: '2%', rotate: 3 },
];

export default function BackgroundDecor() {
  return (
    <div className="bg-decor" aria-hidden="true">
      {POLAROIDS.map((p, i) => (
        <div
          key={i}
          className="polaroid"
          style={{
            width: p.size,
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          <img src={p.src} alt="" />
        </div>
      ))}

      {CAPTIONS.map((c, i) => (
        <span
          key={i}
          className="polaroid-caption"
          style={{
            top: c.top,
            left: c.left,
            right: c.right,
            transform: `rotate(${c.rotate}deg)`,
          }}
        >
          {c.text}
        </span>
      ))}
    </div>
  );
}