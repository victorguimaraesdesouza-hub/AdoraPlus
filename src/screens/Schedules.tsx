import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { useApp } from '../lib/store';
import { hasPermission } from '../lib/permissions';
import { todayISO } from '../lib/date';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ServiceCard } from '../components/ServiceBits';

type FilterTab = 'upcoming' | 'mine' | 'past';

export default function Schedules() {
  const { state, currentUser } = useApp();
  const [tab, setTab] = useState<FilterTab>('upcoming');
  const [query, setQuery] = useState('');
  const today = todayISO();

  const canCreate = hasPermission(currentUser, 'scales.create');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = state.services.filter((service) => {
      if (tab === 'upcoming' && service.date < today) return false;
      if (tab === 'past' && service.date >= today) return false;
      if (
        tab === 'mine' &&
        !service.assignments.some((assignment) => assignment.userId === currentUser?.id)
      ) {
        return false;
      }
      if (!q) return true;
      const inEvent = service.event.toLowerCase().includes(q);
      const inLocation = service.location.toLowerCase().includes(q);
      const inTeam = service.assignments.some((assignment) => {
        const user = state.users.find((u) => u.id === assignment.userId);
        return (
          user?.fullName.toLowerCase().includes(q) ||
          assignment.role.toLowerCase().includes(q)
        );
      });
      return inEvent || inLocation || inTeam;
    });

    return list.sort((a, b) => {
      const cmp = `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
      return tab === 'past' ? -cmp : cmp;
    });
  }, [state.services, state.users, tab, query, today, currentUser?.id]);

  return (
    <div className="page fade-in">
      <PageHeader
        title="Escalas"
        subtitle="Cultos agendados, equipe definida e repertório vinculado."
        actions={
          canCreate ? (
            <Link to="/escalas/nova" className="btn btn--primary btn--sm">
              <Plus size={16} aria-hidden="true" />
              Nova escala
            </Link>
          ) : undefined
        }
      />

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filtrar escalas">
          <button
            type="button"
            aria-pressed={tab === 'upcoming'}
            onClick={() => setTab('upcoming')}
          >
            Próximas
          </button>
          <button
            type="button"
            aria-pressed={tab === 'mine'}
            onClick={() => setTab('mine')}
          >
            Minhas
          </button>
          <button
            type="button"
            aria-pressed={tab === 'past'}
            onClick={() => setTab('past')}
          >
            Passadas
          </button>
        </div>

        <div className="search">
          <Search aria-hidden="true" />
          <input
            type="search"
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar culto, pessoa ou cargo..."
            aria-label="Buscar escalas"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="field-grid">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              mine={service.assignments.some(
                (assignment) => assignment.userId === currentUser?.id,
              )}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title={query ? 'Nenhuma escala encontrada' : 'Nenhuma escala nesta lista'}
          description={
            query
              ? 'Tente outro termo ou limpe a busca.'
              : tab === 'mine'
                ? 'Você ainda não foi escalado em nenhum culto.'
                : 'Quando novas escalas forem criadas, elas aparecem aqui.'
          }
          action={
            canCreate && tab !== 'past' ? (
              <Link to="/escalas/nova" className="btn btn--primary btn--sm">
                <Plus size={15} aria-hidden="true" />
                Criar escala
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
