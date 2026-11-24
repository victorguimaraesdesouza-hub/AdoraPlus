export type Sex = 'masculino' | 'feminino';

export const UNCOES = [
  'Sem Unção',
  'Aspirante',
  'Diácono(a)',
  'Presbítero(a)',
  'Pastor(a)',
  'Bispo(a)',
] as const;

export type Uncao = (typeof UNCOES)[number];

export const DEFAULT_CARGOS = [
  'Líder',
  'Ministro(a)',
  'Backing Vocal',
  'Solista',
  'Tecladista',
  'Baixista',
  'Baterista',
  'Violonista',
  'Guitarrista',
  'Metais',
] as const;

export type PermissionKey =
  | 'scales.create'
  | 'scales.edit'
  | 'scales.delete'
  | 'scales.approve'
  | 'repertoire.manage'
  | 'repertoire.integrations'
  | 'users.view'
  | 'users.manage'
  | 'system.admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  birthDate: string;
  sex: Sex;
  uncao: Uncao;
  cargos: string[];
  permissions: PermissionKey[];
  createdAt: string;
  active: boolean;
}

export interface Assignment {
  userId: string;
  role: string;
}

export interface ServiceSong {
  songId: string;
  key: string;
}

export type ServiceStatus = 'confirmed' | 'draft';

export interface Service {
  id: string;
  date: string;
  time: string;
  callTime?: string;
  event: string;
  location: string;
  notes: string;
  status: ServiceStatus;
  assignments: Assignment[];
  songs: ServiceSong[];
  createdAt: string;
  createdBy: string;
}

export type SongSource = 'manual' | 'google-drive' | 'onedrive';

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm?: number;
  source: SongSource;
  folder?: string;
  referenceUrl?: string;
  addedAt: string;
}

export type Provider = 'google-drive' | 'onedrive';

export interface Integration {
  provider: Provider;
  connected: boolean;
  account?: string;
  folderName?: string;
  lastSync?: string;
  autoSync: boolean;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  date: string;
  pinned: boolean;
  author: string;
}

export type ThemeMode = 'dark' | 'light' | 'soft';

export interface Settings {
  churchName: string;
  cargos: string[];
  preferredSource: Provider | null;
  theme?: ThemeMode;
  notifications: {
    serviceReminder: boolean;
    changes: boolean;
    weeklySummary: boolean;
  };
}

export interface AppState {
  version: number;
  currentUserId: string | null;
  pendingEmail: string | null;
  users: User[];
  services: Service[];
  songs: Song[];
  notices: Notice[];
  integrations: Integration[];
  settings: Settings;
  lastResetAt: string;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function ageFrom(birthDate: string): number {
  const birth = new Date(`${birthDate}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const month = now.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}
