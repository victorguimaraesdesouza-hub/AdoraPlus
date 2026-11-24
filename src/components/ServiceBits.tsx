import { Link } from 'react-router-dom';
import { Clock3, ExternalLink, Music2, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Assignment, Service } from '../lib/types';
import { firstName } from '../lib/types';
import { formatDayMonth, formatShortDate, relativeDay } from '../lib/date';
import { roleRank, sortRoles } from '../lib/roles';
import { serviceSongs, useApp } from '../lib/store';
import { Avatar } from './Avatar';
import { KeyBadge, StatusChip } from './Chips';
import { ScoreMark } from './Marks';

export function TeamList({
  service,
  limit,
  showEmpty = true,
  assignments,
}: {
  service: Service;
  limit?: number;
  showEmpty?: boolean;
  assignments?: Assignment[];
}) {
  const { state } = useApp();
  const source = assignments ?? sortRoles(service.assignments);
  const rows = limit ? source.slice(0, limit) : source;
  const rest = source.length - rows.length;

  if (!source.length) {
    return showEmpty ? <p className="team-empty">Ninguém escalado ainda.</p> : null;
  }

  return (
    <div className="team-list">
      {rows.map((assignment, index) => {
        const user = state.users.find((item) => item.id === assignment.userId);
        if (!user) return null;
        return (
          <div className="team-row" key={`${assignment.userId}-${assignment.role}`}>
            <span className="team-row__staff">
              <ScoreMark role={assignment.role} position={roleRank(assignment.role) + index} />
            </span>
            <span className="team-row__name">{user.fullName}</span>
            <span className="team-row__cargo">{assignment.role}</span>
          </div>
        );
      })}
      {rest > 0 && (
        <div className="team-row team-row--more">
          <span style={{ width: 26 }} aria-hidden="true" />
          <span className="small muted">
            e mais {rest} pessoa{rest > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export function Setlist({
  service,
  limit,
  showMeta = true,
  actions,
}: {
  service: Service;
  limit?: number;
  showMeta?: boolean;
  actions?: (entry: ReturnType<typeof serviceSongs>[number]) => ReactNode;
}) {
  const { state } = useApp();
  const entries = serviceSongs(service, state.songs);
  const rows = limit ? entries.slice(0, limit) : entries;

  if (!rows.length) {
    return (
      <p className="setlist-empty">
        Repertório ainda não definido.
      </p>
    );
  }

  return (
    <div className="song-list">
      {rows.map((song, index) => (
        <div className="song-row" key={`${song.id}-${song.serviceKey}`}>
          <span className="song-row__num">{String(index + 1).padStart(2, '0')}</span>
          <span className="song-row__title">
            {song.title}
            {showMeta && song.artist && <small className="song-row__artist">{song.artist}</small>}
          </span>
          {showMeta && song.bpm ? <span className="song-row__meta">{song.bpm} bpm</span> : null}
          {song.referenceUrl && (
            <a
              href={song.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="song-row__ref"
              aria-label={`Abrir referência de ${song.title}`}
            >
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
          <KeyBadge musicKey={song.serviceKey} />
          {actions && <span className="song-row__actions">{actions(song)}</span>}
        </div>
      ))}
    </div>
  );
}

export function ServiceCard({ service, mine = false }: { service: Service; mine?: boolean }) {
  const { state } = useApp();
  const team = service.assignments.flatMap((assignment) => {
    const user = state.users.find((item) => item.id === assignment.userId);
    return user ? [{ user, role: assignment.role }] : [];
  });

  return (
    <article className={`svc ${mine ? 'svc--mine' : ''}`}>
      <div className="svc__head">
        <div style={{ minWidth: 0 }}>
          <span className="svc__time">
            {service.time} · {relativeDay(service.date)}
          </span>
          <h3 className="svc__title">{service.event}</h3>
        </div>
        {mine ? <span className="chip chip--amber">você</span> : <StatusChip status={service.status} />}
      </div>

      <div className="svc__meta">
        <span className="chip">
          <Users size={13} aria-hidden="true" />
          {service.assignments.length} na equipe
        </span>
        <span className="chip">
          <Music2 size={13} aria-hidden="true" />
          {service.songs.length} música{service.songs.length === 1 ? '' : 's'}
        </span>
        {service.callTime && (
          <span className="chip">
            <Clock3 size={13} aria-hidden="true" />
            Chegada {service.callTime}
          </span>
        )}
      </div>

      <div className="svc__team">
        {team.slice(0, 4).map(({ user, role }) => (
          <span className="chip" key={user.id}>
            <Avatar user={user} size="xs" role={role} />
            {firstName(user.fullName)} · {role}
          </span>
        ))}
        {team.length > 4 && <span className="chip chip--bare">+{team.length - 4}</span>}
      </div>

      <div className="svc__foot">
        <Link to={`/escalas/${service.id}`} className="btn btn--ghost btn--sm">
          Abrir escala
          <ExternalLink size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function UpcomingRow({ service, mine = false }: { service: Service; mine?: boolean }) {
  const day = formatDayMonth(service.date);
  return (
    <Link to={`/escalas/${service.id}`} className="rowitem">
      <div className="rowitem__date">
        <strong>{day.day}</strong>
        <span>{day.weekday}</span>
      </div>
      <div className="rowitem__body">
        <strong>
          {service.event}
          {mine && <span className="rowitem__mine"> · você</span>}
        </strong>
        <span>
          {service.time} · {service.assignments.length} pessoas · {service.songs.length}{' '}
          música{service.songs.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="rowitem__end">
        <Clock3 size={15} aria-hidden="true" />
      </div>
    </Link>
  );
}

export function ServicePill({ service }: { service: Service }) {
  return (
    <Link className="chip chip--amber" to={`/escalas/${service.id}`}>
      {formatShortDate(service.date)} · {service.time}
    </Link>
  );
}
