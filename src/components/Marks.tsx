import { roleColor } from '../lib/roles';

/** The signature backdrop: five hairline staff lines with two faint chalk notes. */
export function StaffLines({ className = '', opacity = 0.5 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={`staff-svg ${className}`}
      viewBox="0 0 600 210"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <g stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <path d="M0 60h600M0 78h600M0 96h600M0 114h600M0 132h600" />
      </g>
      <g fill="var(--amber)" opacity="0.75">
        <ellipse cx="96" cy="96" rx="7" ry="4.6" transform="rotate(-18 96 96)" />
        <path d="M102 94V62l20 5" stroke="var(--amber)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <g fill="var(--chalk-3)" opacity="0.35">
        <ellipse cx="206" cy="114" rx="5.4" ry="3.6" transform="rotate(-18 206 114)" />
        <ellipse cx="300" cy="78" rx="5.4" ry="3.6" transform="rotate(-18 300 78)" />
      </g>
    </svg>
  );
}

/** One member on the staff: a five-line mark with a chalk note head in their function tone. */
export function ScoreMark({ role, position = 0 }: { role?: string | null; position?: number }) {
  const y = [4, 8, 12, 16, 20][position % 5];
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" className="score-mark">
      <g stroke="var(--line-strong)" strokeWidth="0.8" opacity="0.85">
        <path d="M1 4h24M1 8h24M1 12h24M1 16h24M1 20h24" />
      </g>
      <ellipse
        cx="13"
        cy={y}
        rx="4.2"
        ry="3.2"
        transform={`rotate(-20 13 ${y})`}
        fill={roleColor(role)}
      />
      <path d={`M16.8 ${y - 0.6}V${Math.max(2, y - 8)}`} stroke={roleColor(role)} strokeWidth="1.2" />
    </svg>
  );
}

export function StaffRule({ className = '' }: { className?: string }) {
  return (
    <svg className={`staff-rule ${className}`} viewBox="0 0 600 14" preserveAspectRatio="none" aria-hidden="true">
      <g stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <path d="M0 3h600M0 7h600M0 11h600" />
      </g>
    </svg>
  );
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function DriveMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8.7 3.4h6.6L23 15.8h-6.6L8.7 3.4z" fill="#f2c14e" opacity="0.85" />
      <path d="M8.7 3.4 1 16.7l6.3 3.9L15 7.3 8.7 3.4z" fill="#a9d6b8" opacity="0.9" />
      <path d="M7.3 20.6 1 16.7h18.4l-3 5.2H7.3z" fill="#9cc9e6" opacity="0.9" />
    </svg>
  );
}

export function OneDriveMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M9.6 7.2a5.1 5.1 0 0 1 9.2 2.1 4 4 0 0 1 1.7 7.6H6.1a4.3 4.3 0 0 1-.7-8.5 5.1 5.1 0 0 1 4.2-1.2z"
        fill="#9cc9e6"
        opacity="0.9"
      />
      <path d="M6.5 17h13.2a3 3 0 0 1-.6 1.9H6.9l-.4-1.9z" fill="#69a8d4" opacity="0.7" />
    </svg>
  );
}
