interface StaffProps {
  notes?: number;
  className?: string;
  compact?: boolean;
}

/**
 * The signature mark: a five-line staff carrying one note head per person.
 * Decorative where a text label already states the team size.
 */
export function Staff({ notes = 3, className = '', compact = false }: StaffProps) {
  const count = Math.max(0, Math.min(notes, compact ? 5 : 9));
  const width = compact ? 64 : 132;
  const height = compact ? 13 : 25;
  const lineYs = compact ? [2, 4.2, 6.4, 8.6, 10.8] : [4, 8, 12, 16, 20];
  const noteYs = compact ? [4.2, 6.4, 8.6, 4.2, 6.4] : [8, 12, 16, 8, 12, 16, 8, 12, 16];
  const startX = compact ? 9 : 16;
  const step = compact ? 12 : 13.5;
  const rx = compact ? 2.1 : 3.9;
  const ry = compact ? 1.5 : 2.7;

  return (
    <svg
      className={`staff ${compact ? 'staff--compact' : ''} ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <g className="staff__lines">
        {lineYs.map((y) => (
          <line key={y} x1="0" x2={width} y1={y} y2={y} />
        ))}
      </g>
      {Array.from({ length: count }).map((_, index) => {
        const x = startX + index * step;
        const y = noteYs[index % noteYs.length];
        return (
          <g key={index} className="staff__note">
            <ellipse cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(-22 ${x} ${y})`} />
            <line
              x1={x + rx * 0.9}
              x2={x + rx * 0.9}
              y1={y}
              y2={y - (compact ? 5 : 9)}
              className="staff__stem"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function StaffRule({ notes = 0, className = '' }: { notes?: number; className?: string }) {
  return <Staff notes={notes} className={`staff-rule ${className}`} />;
}
