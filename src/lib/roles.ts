export type RoleTone = 'amber' | 'sand' | 'rose' | 'lilac' | 'sky' | 'sage';

export const ROLE_ORDER = [
  'Ministro(a)',
  'Líder',
  'Backing Vocal',
  'Solista',
  'Tecladista',
  'Baixista',
  'Baterista',
  'Guitarrista',
  'Violonista',
  'Metais',
];

const ROLE_TONES: Record<string, RoleTone> = {
  'Ministro(a)': 'amber',
  'Líder': 'sand',
  'Backing Vocal': 'rose',
  'Solista': 'lilac',
  'Tecladista': 'sky',
  'Baixista': 'sage',
  'Baterista': 'rose',
  'Guitarrista': 'sand',
  'Violonista': 'sage',
  'Metais': 'lilac',
};

const FALLBACK_TONES: RoleTone[] = ['sky', 'sage', 'lilac', 'sand', 'rose'];

export function roleTone(role?: string | null): RoleTone {
  if (!role) return 'sky';
  if (ROLE_TONES[role]) return ROLE_TONES[role];
  const hash = Array.from(role).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_TONES[hash % FALLBACK_TONES.length];
}

export function roleColor(role?: string | null): string {
  return `var(--${roleTone(role)})`;
}

export function roleRank(role?: string | null): number {
  if (!role) return 99;
  const index = ROLE_ORDER.indexOf(role);
  return index === -1 ? 90 : index;
}

export function sortRoles<T extends { role: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => roleRank(a.role) - roleRank(b.role));
}
