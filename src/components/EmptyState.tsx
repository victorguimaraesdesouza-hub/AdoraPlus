import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`empty ${compact ? 'empty--compact' : ''}`}>
      <span className="empty__icon" aria-hidden="true">
        <Icon size={compact ? 18 : 22} strokeWidth={1.7} />
      </span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
