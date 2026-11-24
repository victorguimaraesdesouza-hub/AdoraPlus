import { addHours, format } from 'date-fns';
import type { Service, Song, User } from './types';
import { formatTime } from './date';

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function utcStamp(): string {
  return `${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`;
}

export function buildIcs(service: Service, users: User[], songs: Song[]): string {
  const start = new Date(`${service.date}T${service.time}:00`);
  const end = addHours(start, 2);
  const team = service.assignments
    .map((assignment) => {
      const user = users.find((item) => item.id === assignment.userId);
      return user ? `${user.fullName} (${assignment.role})` : null;
    })
    .filter(Boolean)
    .join(', ');
  const setlist = service.songs
    .map((entry, index) => {
      const song = songs.find((item) => item.id === entry.songId);
      return song ? `${index + 1}. ${song.title} — ${entry.key}` : null;
    })
    .filter(Boolean)
    .join('\\n');

  const description = [
    service.notes,
    `Equipe: ${team}`,
    setlist ? `Repertório: ${setlist}` : '',
  ]
    .filter(Boolean)
    .join('\\n\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Salmo//Escalas e Repertorio//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${service.id}@salmo.local`,
    `DTSTAMP:${utcStamp()}`,
    `DTSTART:${format(start, "yyyyMMdd'T'HHmmss")}`,
    `DTEND:${format(end, "yyyyMMdd'T'HHmmss")}`,
    `SUMMARY:${escapeIcs(service.event)}`,
    `LOCATION:${escapeIcs(service.location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(`Chamada: ${service.event} às ${formatTime(service.time)}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(service: Service, users: User[], songs: Song[]): void {
  const blob = new Blob([buildIcs(service, users, songs)], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `salmo-${service.date}-${service.event
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
