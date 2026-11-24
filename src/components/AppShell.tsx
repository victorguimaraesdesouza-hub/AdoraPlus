import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Contrast,
  Home,
  LogOut,
  Menu,
  Moon,
  Music2,
  Settings,
  Sun,
  UserRound,
  Users,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { hasPermission } from '../lib/permissions';
import { firstName, type ThemeMode } from '../lib/types';
import { Avatar } from './Avatar';
import { Logo } from './Logo';
import { Sheet } from './Sheet';

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; icon: typeof Moon }> = [
  { id: 'dark', label: 'Escuro', icon: Moon },
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'soft', label: 'Suave', icon: Contrast },
];

const primaryNav = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/calendario', label: 'Calendário', icon: CalendarDays },
  { to: '/escalas', label: 'Escalas', icon: ClipboardList },
  { to: '/repertorio', label: 'Repertório', icon: Music2 },
];

const sectionNames: Array<{ match: string; label: string }> = [
  { match: '/calendario', label: 'Calendário' },
  { match: '/escalas', label: 'Escalas' },
  { match: '/repertorio', label: 'Repertório' },
  { match: '/usuarios', label: 'Pessoas e permissões' },
  { match: '/configuracoes', label: 'Configurações' },
  { match: '/perfil', label: 'Meu perfil' },
];

export function AppShell({ children }: { children: ReactNode; focus?: boolean }) {
  const { currentUser, state, signOut, patchSettings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!currentUser) return <>{children}</>;

  const theme: ThemeMode = state.settings.theme ?? 'dark';
  const setTheme = (next: ThemeMode) => patchSettings({ theme: next });

  const canSeeUsers = hasPermission(currentUser, 'users.view');
  const moreActive = ['/usuarios', '/configuracoes', '/perfil'].some((path) =>
    location.pathname.startsWith(path),
  );
  const section = sectionNames.find((entry) => location.pathname.startsWith(entry.match))?.label;

  const handleSignOut = () => {
    setMoreOpen(false);
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <aside className="rail" aria-label="Navegação principal">
        <div className="rail__inner">
          <div className="rail__brand">
            <Logo />
          </div>
          <nav className="rail__nav" aria-label="Áreas do ministério">
            <p className="rail__label">Ministério</p>
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `rail__link ${isActive ? 'is-active' : ''}`}
              >
                <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
            <p className="rail__label rail__label--spaced">Gestão</p>
            {canSeeUsers && (
              <NavLink
                to="/usuarios"
                className={({ isActive }) => `rail__link ${isActive ? 'is-active' : ''}`}
              >
                <Users size={19} strokeWidth={1.8} aria-hidden="true" />
                Pessoas
              </NavLink>
            )}
            <NavLink
              to="/configuracoes"
              className={({ isActive }) => `rail__link ${isActive ? 'is-active' : ''}`}
            >
              <Settings size={19} strokeWidth={1.8} aria-hidden="true" />
              Configurações
            </NavLink>
          </nav>

          <div className="rail__foot">
            <div className="theme-switch theme-switch--block" role="group" aria-label="Tema da interface">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="theme-switch__btn"
                  aria-pressed={theme === option.id}
                  onClick={() => setTheme(option.id)}
                >
                  <option.icon size={13} aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            <p className="rail__church">{state.settings.churchName}</p>
            <div className="rail__user">
              <NavLink to="/perfil" className="rail__user-link">
                <Avatar user={currentUser} size="sm" ring />
                <span>
                  <strong>{firstName(currentUser.fullName)}</strong>
                  <small>{currentUser.uncao}</small>
                </span>
              </NavLink>
              <button
                type="button"
                className="rail__signout"
                onClick={handleSignOut}
                aria-label="Sair da conta"
                title="Sair"
              >
                <LogOut size={17} />
              </button>
            </div>
            <p className="rail__demo">Dados de demonstração</p>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <Logo />
          <span className="topbar__context">{section ?? 'Ministério'}</span>
          <div className="topbar__actions">
            <div className="theme-switch theme-switch--compact" role="group" aria-label="Tema da interface">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="theme-switch__btn"
                  aria-pressed={theme === option.id}
                  aria-label={`Tema ${option.label}`}
                  title={`Tema ${option.label}`}
                  onClick={() => setTheme(option.id)}
                >
                  <option.icon size={14} aria-hidden="true" />
                  <span className="theme-switch__label">{option.label}</span>
                </button>
              ))}
            </div>
            <NavLink to="/perfil" className="topbar__user">
              <Avatar user={currentUser} size="sm" ring />
              <span>{firstName(currentUser.fullName)}</span>
            </NavLink>
          </div>
        </header>

        <main id="conteudo" className="main__content" tabIndex={-1}>
          {children}
        </main>
      </div>

      <nav className="nav" aria-label="Navegação principal">
        {primaryNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
          >
            <item.icon size={21} strokeWidth={1.8} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={`nav__link ${moreActive ? 'is-active' : ''}`}
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
        >
          <Menu size={21} strokeWidth={1.8} aria-hidden="true" />
          <span>Mais</span>
        </button>
      </nav>

      <Sheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="Mais"
        description="Sua conta e as áreas de gestão do ministério."
        size="sm"
      >
        <div className="more-user">
          <Avatar user={currentUser} size="lg" />
          <div>
            <p className="more-user__name">{currentUser.fullName}</p>
            <p className="more-user__meta">
              {currentUser.uncao} · {currentUser.email}
            </p>
          </div>
        </div>
        <nav className="more-nav" aria-label="Conta e gestão">
          <NavLink to="/perfil" className="more-nav__item" onClick={() => setMoreOpen(false)}>
            <UserRound size={19} aria-hidden="true" />
            <span>Meu perfil</span>
            <ChevronRight size={17} aria-hidden="true" />
          </NavLink>
          {canSeeUsers && (
            <NavLink to="/usuarios" className="more-nav__item" onClick={() => setMoreOpen(false)}>
              <Users size={19} aria-hidden="true" />
              <span>Pessoas e permissões</span>
              <ChevronRight size={17} aria-hidden="true" />
            </NavLink>
          )}
          <NavLink to="/configuracoes" className="more-nav__item" onClick={() => setMoreOpen(false)}>
            <Settings size={19} aria-hidden="true" />
            <span>Configurações</span>
            <ChevronRight size={17} aria-hidden="true" />
          </NavLink>
        </nav>
        <div className="more-foot">
          <p className="permission-group__title" style={{ marginBottom: 8 }}>
            Tema da interface
          </p>
          <div
            className="theme-switch theme-switch--block"
            role="group"
            aria-label="Tema da interface"
            style={{ marginBottom: 14 }}
          >
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className="theme-switch__btn"
                aria-pressed={theme === option.id}
                onClick={() => setTheme(option.id)}
              >
                <option.icon size={13} aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <button type="button" className="btn btn--ghost btn--block" onClick={handleSignOut}>
            <LogOut size={17} aria-hidden="true" />
            Sair da conta
          </button>
          <p className="more-foot__note">Ambiente de demonstração · dados locais neste navegador</p>
        </div>
      </Sheet>
    </div>
  );
}
