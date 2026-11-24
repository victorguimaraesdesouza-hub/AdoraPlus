import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StaffRule } from './Marks';

export function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Voltar',
  actions,
  compact = false,
  children,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className={`page-head ${compact ? 'page-head--compact' : ''}`}>
      {backTo && (
        <Link className="page-head__back" to={backTo}>
          <ChevronLeft size={16} aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="page-head__row">
        <div className="page-head__copy">
          <h1 className="page-head__title">{title}</h1>
          {subtitle && <p className="page-head__subtitle">{subtitle}</p>}
          {children}
        </div>
        {actions && <div className="page-head__actions">{actions}</div>}
      </div>
      {!compact && <StaffRule className="page-head__rule" />}
    </header>
  );
}

export function SectionHead({
  title,
  count,
  action,
  description,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
  description?: string;
}) {
  return (
    <div className="section__head section__head--wide">
      <div>
        <h2 className="section__title">
          {title}
          {typeof count === 'number' && (
            <span className="section__count" aria-label={`${count} itens`}>
              {count}
            </span>
          )}
        </h2>
        {description && <p className="section__description">{description}</p>}
      </div>
      {action && <div className="section__action">{action}</div>}
    </div>
  );
}
