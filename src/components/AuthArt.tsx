import { Logo } from './Logo';

export function AuthArt({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  return (
    <section className={`auth-art auth-art--${mode}`} aria-label="Salmo">
      <div className="auth-art__brand">
        <Logo tone="light" />
      </div>

      <div className="auth-art__visual" aria-hidden="true">
        <svg viewBox="0 0 780 820" preserveAspectRatio="xMidYMid slice" role="presentation">
          <defs>
            <clipPath id="score-window-clip">
              <circle cx="390" cy="330" r="242" />
            </clipPath>
            <linearGradient id="window-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F3E9CF" stopOpacity="0.09" />
              <stop offset="62%" stopColor="#C9A24B" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0F2A23" stopOpacity="0" />
            </linearGradient>
          </defs>

          <circle cx="390" cy="330" r="242" fill="url(#window-glow)" />
          <g clipPath="url(#score-window-clip)" className="auth-score">
            {[92, 152, 212, 272, 332, 392, 452, 512, 572].map((y) => (
              <g key={y}>
                {[0, 8, 16, 24, 32].map((offset) => (
                  <line key={offset} x1="80" x2="700" y1={y + offset} y2={y + offset} />
                ))}
              </g>
            ))}
            <g className="auth-score__notes">
              <ellipse cx="286" cy="246" rx="10" ry="7" transform="rotate(-20 286 246)" />
              <line x1="295" x2="295" y1="245" y2="218" />
              <ellipse cx="445" cy="354" rx="10" ry="7" transform="rotate(-20 445 354)" />
              <line x1="454" x2="454" y1="353" y2="326" />
              <ellipse cx="512" cy="246" rx="10" ry="7" transform="rotate(-20 512 246)" />
              <line x1="521" x2="521" y1="245" y2="218" />
            </g>
          </g>

          <circle cx="390" cy="330" r="242" className="auth-score__ring" />
          <circle cx="390" cy="330" r="254" className="auth-score__ring auth-score__ring--outer" />

          <g className="auth-river">
            {[0, 13, 26, 39, 52].map((offset) => (
              <path
                key={offset}
                d={`M -40 ${676 + offset} C 180 ${622 + offset}, 370 ${748 + offset}, 560 ${690 + offset} S 800 ${628 + offset}, 860 ${660 + offset}`}
              />
            ))}
            <g className="auth-river__notes">
              <ellipse cx="214" cy="671" rx="8" ry="5.6" transform="rotate(-20 214 671)" />
              <line x1="221" x2="221" y1="670" y2="648" />
              <ellipse cx="540" cy="697" rx="8" ry="5.6" transform="rotate(-20 540 697)" />
              <line x1="547" x2="547" y1="696" y2="674" />
            </g>
          </g>
        </svg>
      </div>

      <div className="auth-art__copy">
        {mode === 'login' ? (
          <>
            <p className="auth-art__quote">
              Cada domingo, uma equipe.
              <br />
              Cada culto, um canto.
            </p>
            <p className="auth-art__sub">
              Escalas, calendário e repertório do ministério em um só lugar — do celular, antes do
              culto começar.
            </p>
          </>
        ) : (
          <>
            <p className="auth-art__quote">
              Seu lugar na equipe
              <br />
              começa aqui.
            </p>
            <p className="auth-art__sub">
              Conte quem você é e como serve. O perfil é seu: nada é importado da sua conta Google.
            </p>
          </>
        )}
      </div>

      <p className="auth-art__verse">
        {mode === 'login' ? '“Cantai ao Senhor um cântico novo.” · Salmo 98:1' : 'Salmo 98:1'}
      </p>
    </section>
  );
}
