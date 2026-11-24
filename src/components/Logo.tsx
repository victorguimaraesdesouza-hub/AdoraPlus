import { Link } from 'react-router-dom';

export function Logo({ compact = false }: { tone?: 'dark' | 'light'; compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="Adora+ — início">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="presentation">
          <g stroke="var(--chalk-3)" strokeWidth="0.9" opacity="0.55">
            <path d="M3 9h26M3 12.7h26M3 16.4h26M3 20.1h26M3 23.8h26" />
          </g>
          <ellipse
            cx="17.6"
            cy="16.6"
            rx="4.1"
            ry="2.9"
            transform="rotate(-22 17.6 16.6)"
            fill="var(--amber)"
          />
          <path
            d="M21.2 15.4V6.2l5.2-1.3v9.2"
            stroke="var(--amber)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse
            cx="23.8"
            cy="5.4"
            rx="2.9"
            ry="2"
            transform="rotate(-22 23.8 5.4)"
            fill="var(--amber)"
          />
        </svg>
      </span>
      {!compact && (
        <span className="brand__word">
          Adora<span className="brand__plus">+</span>
          <small>escala &amp; repertório</small>
        </span>
      )}
    </Link>
  );
}
