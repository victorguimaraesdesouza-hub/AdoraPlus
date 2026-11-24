export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      className="brand__mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14" fill="var(--slate-800)" stroke="var(--line)" strokeWidth="1.5" />
      <g stroke="var(--amber)" strokeWidth="1.2" opacity="0.55">
        <path d="M13 23h38M13 31h38M13 39h38M13 47h38" />
      </g>
      <ellipse cx="27" cy="38" rx="7" ry="5" transform="rotate(-18 27 38)" fill="var(--chalk)" />
      <path d="M33.4 36.6V17.5l11 3.2" stroke="var(--chalk)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function StaffLines({ className = '', opacity = 1 }: { className?: string; opacity?: number }) {
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
      <g fill="var(--amber)" opacity="0.9">
        <ellipse cx="96" cy="96" rx="7" ry="4.6" transform="rotate(-18 96 96)" />
        <path d="M102 94V62l20 5" stroke="var(--amber)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <g fill="var(--chalk-3)" opacity="0.5">
        <ellipse cx="206" cy="114" rx="5.4" ry="3.6" transform="rotate(-18 206 114)" />
        <ellipse cx="300" cy="78" rx="5.4" ry="3.6" transform="rotate(-18 300 78)" />
      </g>
    </svg>
  )
}

export function Scribble({ width = 72, color = 'var(--amber)' }: { width?: number; color?: string }) {
  return (
    <svg
      width={width}
      height="8"
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block', marginTop: 6 }}
    >
      <path
        d="M2 6.1C20 2.6 38 7.1 56 4.2c18-2.9 34 1.5 52-1.1 3-.4 6-.9 10-1.2"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  )
}

export function NoteMark({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg className="note-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ color }}>
      <ellipse cx="8" cy="16.5" rx="4.6" ry="3.4" transform="rotate(-18 8 16.5)" fill="currentColor" />
      <path d="M12.2 15.4V5.2l7 1.9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function MemberNote({ color, position = 2 }: { color: string; position?: number }) {
  const y = [4, 8, 12, 16, 20][position % 5]
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <g stroke="var(--line-strong)" strokeWidth="0.8" opacity="0.9">
        <path d="M1 4h24M1 8h24M1 12h24M1 16h24M1 20h24" />
      </g>
      <circle cx="13" cy={y} r="3.1" fill={color} />
    </svg>
  )
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
