import { useMemo, useState } from 'react';
import { ChevronRight, Lock, Search, Shield, Users } from 'lucide-react';
import { useApp } from '../lib/store';
import {
  PERMISSION_GROUPS,
  PERMISSIONS,
  ROLE_PRESETS,
  detectRolePreset,
  hasPermission,
  isAdmin,
  type RolePresetId,
} from '../lib/permissions';
import { ageFrom, type PermissionKey, type User } from '../lib/types';
import { formatShortDate } from '../lib/date';
import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { Sheet, useToast } from '../components/Sheet';

type RoleFilter = 'all' | RolePresetId;

export default function UsersScreen() {
  const { state, currentUser, updateUser } = useApp();
  const { success, error } = useToast();

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canView = hasPermission(currentUser, 'users.view');
  const canManage = hasPermission(currentUser, 'users.manage');

  const selectedUser = useMemo(
    () => state.users.find((user) => user.id === selectedId) ?? null,
    [state.users, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.users
      .filter((user) => {
        const preset = detectRolePreset(user);
        if (roleFilter !== 'all' && preset !== roleFilter) return false;
        if (!q) return true;
        return (
          user.fullName.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.uncao.toLowerCase().includes(q) ||
          user.cargos.some((cargo) => cargo.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR'));
  }, [state.users, query, roleFilter]);

  if (!canView) {
    return (
      <div className="page">
        <EmptyState
          icon={Lock}
          title="Área restrita à liderança"
          description="Você precisa da permissão de visualização de perfis para acessar esta página."
        />
      </div>
    );
  }

  const adminCount = state.users.filter((user) => isAdmin(user)).length;

  const applyPreset = (user: User, presetId: RolePresetId) => {
    if (!canManage) return;
    if (isAdmin(user) && presetId !== 'admin' && adminCount <= 1) {
      error('Ação bloqueada', 'O ministério precisa manter pelo menos um administrador.');
      return;
    }
    const preset = ROLE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    updateUser(user.id, { permissions: [...preset.permissions] });
    success('Perfil de acesso atualizado', `${user.fullName} agora tem o nível ${preset.label}.`);
  };

  const togglePermission = (user: User, key: PermissionKey) => {
    if (!canManage) return;
    const has = user.permissions.includes(key);
    if (key === 'system.admin' && has && adminCount <= 1) {
      error('Ação bloqueada', 'Mantenha ao menos um administrador no sistema.');
      return;
    }
    const next = has
      ? user.permissions.filter((item) => item !== key)
      : [...user.permissions, key];
    updateUser(user.id, { permissions: next });
  };

  const badgeFor = (user: User) => {
    const preset = detectRolePreset(user);
    if (preset === 'admin') return <span className="badge-role badge-role--admin">Admin</span>;
    if (preset === 'editor') return <span className="badge-role badge-role--lider">Editor</span>;
    if (preset === 'personalizado') return <span className="badge-role">Personalizado</span>;
    return <span className="badge-role">Membro</span>;
  };

  return (
    <div className="page fade-in">
      <PageHeader
        title="Pessoas e permissões"
        subtitle="Todos os membros cadastrados no ministério. Clique em um perfil para atribuir níveis de acesso."
      />

      <div className="toolbar">
        <div className="search">
          <Search aria-hidden="true" />
          <input
            type="search"
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar nome, e-mail, unção ou cargo..."
            aria-label="Buscar pessoas"
          />
        </div>

        <div className="segmented" role="group" aria-label="Filtrar por nível de acesso">
          {(
            [
              ['all', 'Todos'],
              ['admin', 'Admin'],
              ['editor', 'Editor'],
              ['membro', 'Membro'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={roleFilter === value}
              onClick={() => setRoleFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {filtered.map((user) => (
            <button
              key={user.id}
              type="button"
              className="member-row"
              onClick={() => setSelectedId(user.id)}
            >
              <Avatar user={user} />
              <div className="member-row__body">
                <div className="member-row__name">
                  <span>{user.fullName}</span>
                  {badgeFor(user)}
                </div>
                <span className="member-row__meta">
                  {user.uncao} · {user.cargos.join(', ') || 'Sem cargo'}
                </span>
              </div>
              <ChevronRight size={17} aria-hidden="true" style={{ color: 'var(--chalk-4)' }} />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Nenhum perfil encontrado"
          description="Tente limpar o filtro ou buscar por outro nome."
        />
      )}

      <Sheet
        open={Boolean(selectedUser)}
        onClose={() => setSelectedId(null)}
        title={selectedUser?.fullName ?? ''}
        description={selectedUser ? `${selectedUser.uncao} · ${selectedUser.email}` : undefined}
        size="md"
      >
        {selectedUser && (
          <div>
            <div className="member-detail-head">
              <Avatar user={selectedUser} size="lg" />
              <div>
                <h3>{selectedUser.fullName}</h3>
                <p>
                  {selectedUser.uncao} ·{' '}
                  {selectedUser.sex === 'feminino' ? 'Feminino' : 'Masculino'} ·{' '}
                  {ageFrom(selectedUser.birthDate)} anos
                </p>
              </div>
            </div>

            <dl className="kv">
              <dt>E-mail</dt>
              <dd>{selectedUser.email}</dd>
              <dt>Nascimento</dt>
              <dd>{formatShortDate(selectedUser.birthDate)}</dd>
              <dt>Cargos</dt>
              <dd>
                <div className="chip-row">
                  {selectedUser.cargos.map((cargo) => (
                    <span className="chip" key={cargo}>
                      {cargo}
                    </span>
                  ))}
                </div>
              </dd>
            </dl>

            <div style={{ marginTop: 22 }}>
              <p className="permission-group__title">
                <Shield size={12} aria-hidden="true" style={{ display: 'inline', marginRight: 5 }} />
                Perfil de acesso (Admin · Editor · Membro)
              </p>
              <div className="preset-grid">
                {ROLE_PRESETS.map((preset) => {
                  const active = detectRolePreset(selectedUser) === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className="preset-card"
                      aria-pressed={active}
                      disabled={!canManage}
                      onClick={() => applyPreset(selectedUser, preset.id)}
                    >
                      <strong>{preset.label}</strong>
                      <span>{preset.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!canManage && (
              <div className="lock-note">
                <Lock aria-hidden="true" />
                <span>
                  Você tem permissão apenas para consultar perfis. Somente administradores podem
                  alterar permissões.
                </span>
              </div>
            )}

            {PERMISSION_GROUPS.map((group) => {
              const items = PERMISSIONS.filter((permission) => permission.group === group);
              return (
                <div className="permission-group" key={group}>
                  <p className="permission-group__title">{group}</p>
                  {items.map((permission) => {
                    const enabled = selectedUser.permissions.includes(permission.key);
                    return (
                      <div className="toggle-row" key={permission.key}>
                        <div className="toggle-row__body">
                          <strong>{permission.label}</strong>
                          <span>{permission.description}</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={enabled}
                          aria-label={permission.label}
                          className="switch"
                          disabled={!canManage}
                          onClick={() => togglePermission(selectedUser, permission.key)}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </Sheet>
    </div>
  );
}
