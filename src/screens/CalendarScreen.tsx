import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../lib/store';
import { hasPermission } from '../lib/permissions';
import {
  dayKey,
  formatLongDate,
  formatMonthTitle,
  isSameMonth,
  monthMatrix,
  parseISO,
  todayISO,
} from '../lib/date';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ServiceCard } from '../components/ServiceBits';

type Filter = 'all' | 'mine';

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export default function CalendarScreen() {
  const { state, currentUser } = useApp();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');
  const today = todayISO();

  const requested = params.get('dia');
  const selected =
    requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : today;
  const anchor = parseISO(`${selected}T00:00:00`);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const days = useMemo(() => monthMatrix(new Date(year, month, 1, 12)), [year, month]);

  const contents = useMemo(
    () =>
      days.map((date) => {
        const iso = dayKey(date);
        const all = state.services.filter((service) => service.date === iso);
        const services =
          filter === 'mine'
            ? all.filter((service) =>
                service.assignments.some((assignment) => assignment.userId === currentUser?.id),
              )
            : all;
        const mine = all.some((service) =>
          service.assignments.some((assignment) => assignment.userId === currentUser?.id),
        );
        return { iso, date, services, mine };
      }),
    [days, state.services, filter, currentUser?.id],
  );

  const monthAnchor = new Date(year, month, 1, 12);
  const monthServices = contents.filter((item) => isSameMonth(item.date, monthAnchor));
  const visibleCount = monthServices.reduce((total, item) => total + item.services.length, 0);
  const myCount = monthServices.filter((item) => item.mine).length;
  const selectedServices =
    contents.find((item) => item.iso === selected)?.services ?? [];
  const mineOnSelected = selectedServices.some((service) =>
    service.assignments.some((assignment) => assignment.userId === currentUser?.id),
  );

  const selectDay = (iso: string) => setParams({ dia: iso });
  const goToMonth = (offset: number) => {
    const next = new Date(year, month + offset, 1, 12);
    setParams({ dia: dayKey(next) });
  };
  const goToday = () => setParams({ dia: today });

  const canCreate = hasPermission(currentUser, 'scales.create');

  return (
    <div className="page">
      <PageHeader
        title="Calendário"
        subtitle="O mês do ministério. Um dia com marcação é um dia com culto — o losango âmbar é a sua participação."
        actions={
          <>
            <button type="button" className="btn btn--ghost btn--sm" onClick={goToday}>
              Hoje
            </button>
            {canCreate && (
              <Link to={`/escalas/nova?data=${selected}`} className="btn btn--primary btn--sm">
                <Plus size={16} aria-hidden="true" />
                Nova escala
              </Link>
            )}
          </>
        }
      />

      <div className="filter-row">
        <div className="segmented" role="group" aria-label="Filtrar calendário">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            Todos os cultos
          </button>
          <button type="button" aria-pressed={filter === 'mine'} onClick={() => setFilter('mine')}>
            Só as minhas
          </button>
        </div>
        <p className="filter-row__summary">
          <SlidersHorizontal size={14} aria-hidden="true" />
          {visibleCount} culto{visibleCount === 1 ? '' : 's'} no mês
          {myCount > 0 && ` · ${myCount} dia${myCount === 1 ? '' : 's'} com você`}
        </p>
      </div>

      <div className="cal-layout">
        <section aria-label="Calendário do mês">
          <div className="cal-head">
            <div>
              <div className="cal-month">{formatMonthTitle(anchor)}</div>
            </div>
            <div className="cal-nav">
              <button
                type="button"
                className="icon-btn"
                onClick={() => goToMonth(-1)}
                aria-label="Mês anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => goToMonth(1)}
                aria-label="Próximo mês"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="cal-grid" aria-label={`Dias de ${formatMonthTitle(anchor)}`}>
            {WEEKDAYS.map((label, index) => (
              <div key={`${label}-${index}`} className="cal-weekday">
                {label}
              </div>
            ))}
            {contents.map(({ iso, date, services, mine }) => {
              const outside = !isSameMonth(date, monthAnchor);
              const isSelected = iso === selected;
              return (
                <button
                  key={iso}
                  type="button"
                  className={[
                    'cal-day',
                    outside ? 'is-outside' : '',
                    iso === today ? 'is-today' : '',
                    isSelected ? 'is-selected' : '',
                    mine && !outside ? 'is-mine' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectDay(iso)}
                  aria-label={`${formatLongDate(iso)}, ${services.length} culto${
                    services.length === 1 ? '' : 's'
                  }${mine ? ', você está escalada' : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className="cal-day__num">{date.getDate()}</span>
                  <span className="cal-day__dots" aria-hidden="true">
                    {services.slice(0, 4).map((service) => {
                      const assigned = service.assignments.some(
                        (assignment) => assignment.userId === currentUser?.id,
                      );
                      const open = service.assignments.length === 0;
                      return (
                        <span
                          key={service.id}
                          className={[
                            'cal-day__dot',
                            assigned ? 'cal-day__dot--mine' : '',
                            open ? 'cal-day__dot--open' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                      );
                    })}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="legend" aria-label="Legenda do calendário">
            <span>
              <i className="mine" /> losango âmbar: você está escalada
            </span>
            <span>
              <i /> ponto: culto com equipe
            </span>
            <span>
              <i className="open" /> tracejado: equipe a definir
            </span>
          </div>
        </section>

        <section className="day-panel" aria-label="Cultos do dia selecionado" aria-live="polite">
          <div className="day-panel__head">
            <h2>{formatLongDate(selected)}</h2>
            <span className="small muted">
              {selectedServices.length} culto{selectedServices.length === 1 ? '' : 's'}
            </span>
          </div>

          {selectedServices.length ? (
            selectedServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                mine={service.assignments.some(
                  (assignment) => assignment.userId === currentUser?.id,
                )}
              />
            ))
          ) : (
            <div className="day-panel__empty">
              <EmptyState
                icon={CalendarDays}
                title={filter === 'mine' && mineOnSelected ? 'Você não está neste dia' : 'Nenhum culto neste dia'}
                description={
                  filter === 'mine' && mineOnSelected
                    ? 'Troque o filtro para ver a equipe completa.'
                    : 'O calendário do ministério está livre nesta data.'
                }
                compact
                action={
                  canCreate ? (
                    <Link
                      to={`/escalas/nova?data=${selected}`}
                      className="btn btn--ghost btn--sm"
                    >
                      <Plus size={15} aria-hidden="true" />
                      Criar escala para este dia
                    </Link>
                  ) : undefined
                }
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
