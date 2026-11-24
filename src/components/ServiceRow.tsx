import { ChevronRight, Clock3 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Service, User } from '../lib/types';
import { formatDayMonth, formatTime, relativeDay } from '../lib/date';
import { myAssignment, teamFor } from '../lib/services';
import { AvatarStack } from './Avatar';
import { RoleChip, StatusChip } from './Chips';

export function DateTile({ iso, muted = false }: { iso: string; muted?: boolean }) {
  const { day, month, weekday } = formatDayMonth(iso);
  return (
    <time className={`date-tile ${muted ? 'date-tile--muted' : ''}`} dateTime={iso}>
      <span className="date-tile__month">{month}</span>
      <strong className="date-tile__day">{day}</strong>
      <span className="date-tile__weekday">{weekday}</span>
    </time>
  );
}

export function ServiceRow({
  service,
  users,
  currentUserId,
  showStatus = false,
  showRelative = false,
}: {
  service: Service;
  users: User[];
  currentUserId?: string | null;
  showStatus?: boolean;
  showRelative?: boolean;
}) {
  const team = teamFor(service, users);
  const mine = myAssignment(service, currentUserId);
  return (
    <Link to={`/escalas/${service.id}`} className="service-row">
      <DateTile iso={service.date} />
      <span className="service-row__body">
        <span className="service-row__top">
          <span className="service-row__event">{service.event}</span>
          {showStatus && service.status === 'draft' && <StatusChip status="draft" />}
          {showRelative && <span className="service-row__when">{relativeDay(service.date)}</span>}
        </span>
        <span className="service-row__meta">
          <Clock3 size={13} aria-hidden="true" />
          {formatTime(service.time)}
          <span className="dot-sep" aria-hidden="true" />
          {service.location}
        </span>
        <span className="service-row__teamline">
          <AvatarStack users={team} max={4} size="xs" />
          <span>
            {team.length} {team.length === 1 ? 'pessoa' : 'pessoas'}
          </span>
          <span className="dot-sep" aria-hidden="true" />
          <span>
            {service.songs.length} {service.songs.length === 1 ? 'música' : 'músicas'}
          </span>
        </span>
        {mine && (
          <span className="service-row__mine">
            <RoleChip role={mine.role} />
            <span>Você serve neste culto</span>
          </span>
        )}
      </span>
      <span className="service-row__end" aria-hidden="true">
        <ChevronRight size={18} />
      </span>
    </Link>
  );
}

export function ServiceMonthGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="month-group">
      <h2 className="month-group__label">{label}</h2>
      <div className="ledger">{children}</div>
    </section>
  );
}
