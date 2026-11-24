import type { PermissionKey, User } from './types';

export interface PermissionMeta {
  key: PermissionKey;
  label: string;
  description: string;
  group: string;
}

export const PERMISSION_GROUPS = [
  'Escalas',
  'Repertório',
  'Pessoas',
  'Sistema',
] as const;

export const PERMISSIONS: PermissionMeta[] = [
  {
    key: 'scales.create',
    label: 'Criar escalas',
    description: 'Montar novos cultos e definir a equipe.',
    group: 'Escalas',
  },
  {
    key: 'scales.edit',
    label: 'Editar escalas',
    description: 'Alterar horários, participantes e repertório de uma escala.',
    group: 'Escalas',
  },
  {
    key: 'scales.delete',
    label: 'Excluir escalas',
    description: 'Remover definitivamente uma escala do calendário.',
    group: 'Escalas',
  },
  {
    key: 'scales.approve',
    label: 'Aprovar escalas',
    description: 'Confirmar uma escala em rascunho para a equipe.',
    group: 'Escalas',
  },
  {
    key: 'repertoire.manage',
    label: 'Gerenciar repertórios',
    description: 'Adicionar, editar e vincular músicas às escalas.',
    group: 'Repertório',
  },
  {
    key: 'repertoire.integrations',
    label: 'Gerenciar integrações',
    description: 'Conectar, sincronizar e desconectar Google Drive e OneDrive.',
    group: 'Repertório',
  },
  {
    key: 'users.view',
    label: 'Visualizar perfis',
    description: 'Ver a lista de membros, funções e cargos.',
    group: 'Pessoas',
  },
  {
    key: 'users.manage',
    label: 'Gerenciar permissões',
    description: 'Atribuir ou retirar permissões dos membros.',
    group: 'Pessoas',
  },
  {
    key: 'system.admin',
    label: 'Administrar o sistema',
    description: 'Acesso amplo a todas as áreas e configurações.',
    group: 'Sistema',
  },
];

export function hasPermission(user: User | null | undefined, key: PermissionKey): boolean {
  if (!user) return false;
  return user.permissions.includes('system.admin') || user.permissions.includes(key);
}

export function isAdmin(user: User | null | undefined): boolean {
  return hasPermission(user, 'system.admin');
}

export function permissionLabel(key: PermissionKey): string {
  return PERMISSIONS.find((permission) => permission.key === key)?.label ?? key;
}

export function permissionCount(user: User): number {
  return isAdmin(user) ? PERMISSIONS.length : user.permissions.length;
}

export type RolePresetId = 'admin' | 'editor' | 'membro';

export interface RolePreset {
  id: RolePresetId;
  label: string;
  description: string;
  permissions: PermissionKey[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Acesso total: escalas, repertórios, integrações, perfis e permissões.',
    permissions: [
      'scales.create',
      'scales.edit',
      'scales.delete',
      'scales.approve',
      'repertoire.manage',
      'repertoire.integrations',
      'users.view',
      'users.manage',
      'system.admin',
    ],
  },
  {
    id: 'editor',
    label: 'Editor',
    description: 'Cria e edita escalas, gerencia repertório e visualiza perfis da equipe.',
    permissions: [
      'scales.create',
      'scales.edit',
      'scales.approve',
      'repertoire.manage',
      'users.view',
    ],
  },
  {
    id: 'membro',
    label: 'Membro',
    description: 'Consulta o calendário, suas escalas, avisos e o repertório dos cultos.',
    permissions: [],
  },
];

export function detectRolePreset(user: User): RolePresetId | 'personalizado' {
  if (isAdmin(user)) return 'admin';
  if (user.permissions.length === 0) return 'membro';
  const editorPerms = ROLE_PRESETS.find((preset) => preset.id === 'editor')!.permissions;
  const matchesEditor =
    user.permissions.length === editorPerms.length &&
    editorPerms.every((perm) => user.permissions.includes(perm));
  return matchesEditor ? 'editor' : 'personalizado';
}
