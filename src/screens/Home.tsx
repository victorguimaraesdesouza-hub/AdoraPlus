import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  MapPin,
  Music2,
  Plus,
  Settings,
  Users,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { hasPermission } from '../lib/permissions';
import { firstName } from '../lib/types';
import {
  formatDayMonth,
  formatLongDate,
  formatShortDate,
  formatTime,
  relativeDay,
  todayISO,
} from '../lib/date';
import { AvatarStack } from '../components/Avatar';
import { UpcomingRow } from '../components/ServiceBits';
import { StatusChip } from '../components/Chips';

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Home() {
  const { state, currentUser } = useApp();
  if (!currentUser) return null;

  const today = todayISO();
  const upcoming = [...state.services]
    .filter((service) => service.date >= today)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const next = upcoming[0];
  const following = upcoming.slice(1, 5);

  const myAssignment = next?.assignments.find((assignment) => assignment.userId === currentUser.id);
  const team = (next?.assignments ?? [])
    .map((assignment) => state.users.find((user) => user.id === assignment.userId))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });

  const notices = [...state.notices].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date),
  );

  const canCreate = hasPermission(currentUser, 'scales.create');
  const canEdit = hasPermission(currentUser, 'scales.edit');
  const canSeeUsers = hasPermission(currentUser, 'users.view');
  const connection = state.integrations.find((integration) => integration.connected);

  return (
    <div className="page fade-in">
      <div className="greeting">
        <div>
          <h1>
            {timeGreeting()}, <em>{firstName(currentUser.fullName)}</em>.
          </h1>
          <div className="greeting__date">{formatLongDate(today)}</div>
        </div>
        {canCreate && (
          <Link to="/escalas/nova" className="btn btn--primary btn--sm">
            <Plus size={16} aria-hidden="true" />
            Nova escala
          </Link>
        )}
      </div>

      {/* Bloco 1: Acesso rápido — clareza imediata das áreas do sistema */}
      <nav className="quick-grid" aria-label="Acesso rápido">
        <Link to="/calendario" className="quick-tile">
          <span className="quick-tile__icon">
            <CalendarDays size={18} aria-hidden="true" />
          </span>
          <div className="quick-tile__body">
            <strong>Calendário</strong>
            <span>{upcoming.length} próximos cultos</span>
          </div>
          <ChevronRight size={15} className="quick-tile__arrow" aria-hidden="true" />
        </Link>

        <Link to="/escalas" className="quick-tile">
          <span className="quick-tile__icon">
            <ClipboardList size={18} aria-hidden="true" />
          </span>
          <div className="quick-tile__body">
            <strong>Escalas</strong>
            <span>Ver e montar equipes</span>
          </div>
          <ChevronRight size={15} className="quick-tile__arrow" aria-hidden="true" />
        </Link>

        <Link to="/repertorio" className="quick-tile">
          <span className="quick-tile__icon">
            <Music2 size={18} aria-hidden="true" />
          </span>
          <div className="quick-tile__body">
            <strong>Repertório</strong>
            <span>
              {state.songs.length} músicas · {connection ? 'Conectado' : 'Configurar'}
            </span>
          </div>
          <ChevronRight size={15} className="quick-tile__arrow" aria-hidden="true" />
        </Link>

        <Link to={canSeeUsers ? '/usuarios' : '/configuracoes'} className="quick-tile">
          <span className="quick-tile__icon">
            {canSeeUsers ? (
              <Users size={18} aria-hidden="true" />
            ) : (
              <Settings size={18} aria-hidden="true" />
            )}
          </span>
          <div className="quick-tile__body">
            <strong>{canSeeUsers ? 'Pessoas' : 'Configurações'}</strong>
            <span>{canSeeUsers ? `${state.users.length} membros e acessos` : 'Tema e preferências'}</span>
          </div>
          <ChevronRight size={15} className="quick-tile__arrow" aria-hidden="true" />
        </Link>
      </nav>

      {/* Bloco 2: Próximo culto + Sua semana */}
      <div className="home-grid" style={{ marginTop: 22 }}>
        <div className="stack">
          <section className="panel" aria-labelledby="next-service-head">
            <header className="panel__head">
              <div className="panel__title">
                <CalendarDays size={15} aria-hidden="true" />
                <h2 id="next-service-head">Próximo culto</h2>
              </div>
              {next && <StatusChip status={next.status} />}
            </header>

            <div className="panel__body">
              {next ? (
                <>
                  <div className="hero__top">
                    <div>
                      <p className="hero__when">
                        {formatShortDate(next.date)}
                        <span className="chip chip--amber">{relativeDay(next.date)}</span>
                      </p>
                      <div className="hero__time">{formatTime(next.time)}</div>
                    </div>
                    {team.length > 0 && <AvatarStack users={team} max={5} />}
                  </div>

                  <h3 className="hero__title">{next.event}</h3>

                  <div className="hero__meta">
                    {next.callTime && (
                      <span className="chip">
                        <Clock3 size={13} aria-hidden="true" />
                        Chegada {formatTime(next.callTime)}
                      </span>
                    )}
                    {next.location && (
                      <span className="chip">
                        <MapPin size={13} aria-hidden="true" />
                        {next.location}
                      </span>
                    )}
                    <span className="chip">
                      <Users size={13} aria-hidden="true" />
                      {next.assignments.length} na equipe
                    </span>
                    <span className="chip">
                      <Music2 size={13} aria-hidden="true" />
                      {next.songs.length} {next.songs.length === 1 ? 'música' : 'músicas'}
                    </span>
                  </div>

                  {myAssignment ? (
                    <div className="hero__seal">
                      <span className="note-dot" aria-hidden="true" />
                      Você está {currentUser.sex === 'feminino' ? 'escalada' : 'escalado'} como{' '}
                      <strong>{myAssignment.role}</strong>
                    </div>
                  ) : (
                    <div className="status-banner">
                      Você não está {currentUser.sex === 'feminino' ? 'escalada' : 'escalado'} neste
                      culto.
                    </div>
                  )}

                  <div className="hero__actions">
                    <Link to={`/escalas/${next.id}`} className="btn btn--primary">
                      Abrir escala completa
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                    <Link to={`/repertorio?service=${next.id}`} className="btn btn--ghost">
                      <Music2 size={16} aria-hidden="true" />
                      Repertório
                    </Link>
                  </div>
                </>
              ) : (
                <div className="empty">
                  <strong>Nenhum culto agendado</strong>
                  <p>Quando a liderança montar a próxima escala, ela aparecerá aqui.</p>
                  {canCreate && (
                    <div className="empty__action">
                      <Link to="/escalas/nova" className="btn btn--primary btn--sm">
                        <Plus size={16} aria-hidden="true" />
                        Criar primeira escala
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {canEdit && next && next.status === 'draft' && (
            <div className="attention">
              <AlertCircle aria-hidden="true" />
              <p>
                <strong>A escala do próximo culto ainda é rascunho.</strong> Revise e confirme para
                a equipe.
              </p>
              <Link
                to={`/escalas/${next.id}/editar`}
                className="btn btn--ghost btn--sm attention__action"
              >
                Revisar
              </Link>
            </div>
          )}

          {/* Avisos em painel separado e claro */}
          <section className="panel" aria-labelledby="avisos-head">
            <header className="panel__head">
              <div className="panel__title">
                <Bell size={15} aria-hidden="true" />
                <h2 id="avisos-head">Avisos do ministério</h2>
              </div>
              <span className="chip">{notices.length} avisos</span>
            </header>
            <div className="panel__body">
              <div className="notice-list">
                {notices.map((notice) => (
                  <article
                    className={`notice ${notice.pinned ? 'notice--pinned' : ''}`}
                    key={notice.id}
                  >
                    <div className="notice__head">
                      <h3>{notice.title}</h3>
                      {notice.pinned && <span className="chip chip--amber">Fixado</span>}
                    </div>
                    <p>{notice.body}</p>
                    <footer className="notice__foot">
                      <span>{notice.author}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatShortDate(notice.date)}</span>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="stack" aria-label="Sua semana e agenda">
          <section className="panel" aria-labelledby="week-head">
            <header className="panel__head">
              <div className="panel__title">
                <CalendarDays size={15} aria-hidden="true" />
                <h2 id="week-head">Sua semana</h2>
              </div>
              <Link to="/calendario" className="link-inline">
                Ver mês
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </header>
            <div className="panel__body">
              <div className="week">
                {week.map((date) => {
                  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  const dayServices = state.services.filter((service) => service.date === iso);
                  const mine = dayServices.some((service) =>
                    service.assignments.some((assignment) => assignment.userId === currentUser.id),
                  );
                  const day = formatDayMonth(iso);
                  return (
                    <Link
                      key={iso}
                      to={`/calendario?dia=${iso}`}
                      className={`week__day ${iso === today ? 'is-today' : ''} ${mine ? 'is-mine' : ''}`}
                      aria-label={`${formatLongDate(iso)}${mine ? ', você está escalado' : ''}`}
                    >
                      <span className="week__name">{day.weekday.slice(0, 3)}</span>
                      <span className="week__num">{day.day}</span>
                      <span className="week__dots" aria-hidden="true">
                        {mine && <span className="week__dot week__dot--mine" />}
                        {!mine &&
                          dayServices.slice(0, 3).map((service) => (
                            <span key={service.id} className="week__dot" />
                          ))}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="panel" aria-labelledby="following-head">
            <header className="panel__head">
              <div className="panel__title">
                <ClipboardList size={15} aria-hidden="true" />
                <h2 id="following-head">Próximas datas</h2>
              </div>
              <Link to="/escalas" className="link-inline">
                Todas
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </header>
            <div className="panel__body panel__body--flush">
              {following.length > 0 ? (
                <div className="rowlist" style={{ borderTop: 0 }}>
                  {following.map((service) => (
                    <UpcomingRow
                      key={service.id}
                      service={service}
                      mine={service.assignments.some(
                        (assignment) => assignment.userId === currentUser.id,
                      )}
                    />
                  ))}
                </div>
              ) : (
                <p className="small muted" style={{ padding: '16px' }}>
                  Nenhum outro culto agendado por enquanto.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
