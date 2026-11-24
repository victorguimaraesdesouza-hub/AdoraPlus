import { ShieldX } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';

export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="page">
      <PageHeader title="Acesso restrito" subtitle="Esta área é reservada à liderança do ministério." />
      <div className="sheet-panel access-panel">
        <span className="access-panel__icon" aria-hidden="true">
          <ShieldX size={24} />
        </span>
        <h2 className="access-panel__title">Você ainda não tem permissão para esta área</h2>
        <p className="access-panel__text">
          {message ??
            'Peça a um administrador para revisar suas permissões em Usuários. Seu acesso a escalas, calendário e repertório continua disponível.'}
        </p>
        <a href="/calendario" className="btn btn--outline btn--sm">
          Voltar ao calendário
        </a>
      </div>
    </div>
  );
}

export function NotFoundBlock({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="sheet-panel access-panel">
      <span className="access-panel__icon" aria-hidden="true">
        <ShieldX size={24} />
      </span>
      <h2 className="access-panel__title">{title}</h2>
      <p className="access-panel__text">{description}</p>
      {action}
    </div>
  );
}
