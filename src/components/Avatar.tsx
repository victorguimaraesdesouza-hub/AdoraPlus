import { initials, type User } from '../lib/types';
import { roleTone } from '../lib/roles';

interface AvatarProps {
  user?: Pick<User, 'fullName' | 'cargos'>;
  name?: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
}

export function Avatar({ user, name, role, size = 'md', ring = false }: AvatarProps) {
  const displayName = name ?? user?.fullName ?? '?';
  const displayRole = role ?? user?.cargos[0];
  const tone = roleTone(displayRole);
  return (
    <span
      className={`avatar avatar--${size} avatar--${tone} ${ring ? 'avatar--ring' : ''}`}
      title={displayName}
      aria-label={displayName}
    >
      {initials(displayName)}
    </span>
  );
}

export function AvatarStack({
  users,
  max = 4,
  size = 'sm',
}: {
  users: Pick<User, 'id' | 'fullName' | 'cargos'>[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}) {
  const visible = users.slice(0, max);
  const remaining = users.length - visible.length;
  return (
    <span className="avatar-stack" aria-label={`${users.length} pessoas na equipe`}>
      {visible.map((user) => (
        <Avatar key={user.id} user={user} size={size} ring />
      ))}
      {remaining > 0 && (
        <span className={`avatar avatar--${size} avatar--more avatar--ring`}>+{remaining}</span>
      )}
    </span>
  );
}
