import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function toDate(iso: string): Date {
  return parseISO(`${iso}T00:00:00`);
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatLongDate(iso: string): string {
  return capitalize(format(toDate(iso), "EEEE, d 'de' MMMM", { locale: ptBR }));
}

export function formatShortDate(iso: string): string {
  return capitalize(format(toDate(iso), "d 'de' MMM", { locale: ptBR }));
}

export function formatMonthTitle(date: Date): string {
  return capitalize(format(date, 'MMMM yyyy', { locale: ptBR }));
}

export function formatDayMonth(iso: string): { day: string; month: string; weekday: string } {
  const date = toDate(iso);
  return {
    day: format(date, 'dd'),
    month: format(date, 'MMM', { locale: ptBR }).replace('.', '').toUpperCase(),
    weekday: format(date, 'EEE', { locale: ptBR }).replace('.', '').toUpperCase(),
  };
}

export function formatTime(time: string): string {
  return time.replace(':', 'h');
}

export function relativeDay(iso: string): string {
  const diff = differenceInCalendarDays(toDate(iso), startOfDay(new Date()));
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff === -1) return 'Ontem';
  if (diff > 1 && diff <= 7) return `Em ${diff} dias`;
  if (diff < -1 && diff >= -7) return `Há ${Math.abs(diff)} dias`;
  return capitalize(format(toDate(iso), "d 'de' MMM", { locale: ptBR }));
}

export function isUpcoming(iso: string): boolean {
  const today = startOfDay(new Date());
  return toDate(iso) >= today;
}

export function isPast(iso: string): boolean {
  return !isUpcoming(iso);
}

export function monthMatrix(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export { addDays, isSameDay, isSameMonth, startOfDay, format, parseISO };
