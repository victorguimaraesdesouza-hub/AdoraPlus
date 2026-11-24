import { roleColor } from '../lib/roles';

export function RoleChip({
  role,
  soft = true,
  className = '',
}: {
  role: string;
  soft?: boolean;
  className?: string;
}) {
  return (
    <span className={`chip chip--role ${soft ? 'chip--soft' : ''} ${className}`}>
      <span className="chip__dot" style={{ background: roleColor(role) }} aria-hidden="true" />
      {role}
    </span>
  );
}

export function KeyBadge({ musicKey, label = 'Tom' }: { musicKey: string; label?: string }) {
  return (
    <span className="key-badge" title={`${label} ${musicKey}`}>
      <span className="key-badge__label">{label}</span>
      <span className="key-badge__value">{musicKey}</span>
    </span>
  );
}

export function StatusChip({ status }: { status: 'confirmed' | 'draft' }) {
  return (
    <span className={`status-chip status-chip--${status}`}>
      <span className="status-chip__dot" aria-hidden="true" />
      {status === 'confirmed' ? 'Confirmada' : 'Rascunho'}
    </span>
  );
}

export function SourceChip({
  source,
}: {
  source: 'google-drive' | 'onedrive' | 'manual';
}) {
  const label =
    source === 'google-drive' ? 'Google Drive' : source === 'onedrive' ? 'OneDrive' : 'Manual';
  const tone = source === 'google-drive' ? 'amber' : source === 'onedrive' ? 'sky' : 'neutral';
  return (
    <span className={`source-chip source-chip--${tone}`}>
      <span className="source-chip__mark" aria-hidden="true" />
      {label}
    </span>
  );
}
