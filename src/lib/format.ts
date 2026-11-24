const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const WEEK = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const WEEK_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}

export function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISO(new Date())
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} de ${year}`
}

export function weekdayLong(iso: string): string {
  return WEEK[parseISO(iso).getDay()]
}

export function weekdayShort(iso: string): string {
  return WEEK_SHORT[parseISO(iso).getDay()]
}

export function dayNumber(iso: string): number {
  return parseISO(iso).getDate()
}

export function formatShort(iso: string): string {
  const d = parseISO(iso)
  return `${WEEK_SHORT[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()].slice(0, 3)}`
}

export function formatLong(iso: string): string {
  const d = parseISO(iso)
  return `${WEEK[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

export function relativeLabel(iso: string): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = parseISO(iso)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  if (diff === -1) return 'ontem'
  if (diff > 1 && diff < 7) return `em ${diff} dias`
  if (diff < -1 && diff > -7) return `há ${Math.abs(diff)} dias`
  return formatShort(iso)
}

export function monthMatrix(year: number, month: number): string[] {
  const first = new Date(year, month, 1, 12, 0, 0)
  const start = new Date(year, month, 1 - first.getDay(), 12, 0, 0)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return toISO(d)
  })
}

export function sameMonth(iso: string, year: number, month: number): boolean {
  const d = parseISO(iso)
  return d.getFullYear() === year && d.getMonth() === month
}

export function sortByDateTime<T extends { date: string; time: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
}

export function ageFrom(birthDate: string, at = new Date()): number {
  const b = parseISO(birthDate)
  let age = at.getFullYear() - b.getFullYear()
  const m = at.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && at.getDate() < b.getDate())) age -= 1
  return age
}

export function timeGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function durationFromSongs(minutes?: number[]): string {
  const total = (minutes ?? []).reduce((a, b) => a + b, 0)
  if (!total) return '—'
  return `${total} min`
}
