import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Lock, Plus, Users, X } from 'lucide-react';
import { useApp } from '../lib/store';
import { hasPermission } from '../lib/permissions';
import type { Assignment, Service, ServiceStatus } from '../lib/types';
import { nowISO, todayISO } from '../lib/date';
import { PageHeader } from '../components/PageHeader';
import { Field, FormSection } from '../components/Field';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Sheet';

export default function ServiceEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, currentUser, saveService, newId } = useApp();
  const { success } = useToast();

  const editing = Boolean(id);
  const existing = state.services.find((item) => item.id === id);
  const allowed = hasPermission(currentUser, editing ? 'scales.edit' : 'scales.create');
  const canApprove = hasPermission(currentUser, 'scales.approve');

  const [date, setDate] = useState(existing?.date ?? params.get('data') ?? todayISO());
  const [time, setTime] = useState(existing?.time ?? '19:00');
  const [callTime, setCallTime] = useState(existing?.callTime ?? '18:00');
  const [eventName, setEventName] = useState(existing?.event ?? 'Culto de Celebração');
  const [location, setLocation] = useState(existing?.location ?? 'Templo sede');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [status, setStatus] = useState<ServiceStatus>(
    existing?.status ?? (canApprove ? 'confirmed' : 'draft'),
  );
  const [assignments, setAssignments] = useState<Assignment[]>(existing?.assignments ?? []);

  const [pickerUserId, setPickerUserId] = useState('');
  const [pickerRole, setPickerRole] = useState(state.settings.cargos[0] ?? 'Backing Vocal');
  const [touched, setTouched] = useState(false);

  const availableUsers = useMemo(() => {
    const assigned = new Set(assignments.map((item) => item.userId));
    return state.users
      .filter((user) => user.active && !assigned.has(user.id))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR'));
  }, [assignments, state.users]);

  if (!allowed) {
    return (
      <div className="page">
        <EmptyState
          icon={Lock}
          title="Sem permissão"
          description="Apenas administradores ou editores autorizados podem criar e editar escalas."
          action={
            <Link to="/escalas" className="btn btn--ghost btn--sm">
              Voltar para escalas
            </Link>
          }
        />
      </div>
    );
  }

  if (editing && !existing) {
    return (
      <div className="page">
        <EmptyState
          icon={Users}
          title="Escala não encontrada"
          description="Ela pode ter sido removida."
          action={
            <Link to="/escalas" className="btn btn--ghost btn--sm">
              Voltar para escalas
            </Link>
          }
        />
      </div>
    );
  }

  const errors = {
    date: !date ? 'Informe a data do culto.' : '',
    time: !time ? 'Informe o horário.' : '',
    eventName: eventName.trim().length < 3 ? 'Informe o nome do evento ou culto.' : '',
  };

  const handleAddAssignment = () => {
    const uid = pickerUserId || availableUsers[0]?.id;
    if (!uid || !pickerRole) return;
    setAssignments((current) => [...current, { userId: uid, role: pickerRole }]);
    setPickerUserId('');
  };

  const handleRemoveAssignment = (userId: string) => {
    setAssignments((current) => current.filter((item) => item.userId !== userId));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (errors.date || errors.time || errors.eventName) return;

    const serviceId = existing?.id ?? newId('svc');
    const payload: Service = {
      id: serviceId,
      date,
      time,
      callTime: callTime.trim() || undefined,
      event: eventName.trim(),
      location: location.trim(),
      notes: notes.trim(),
      status: canApprove ? status : existing?.status ?? 'draft',
      assignments,
      songs: existing?.songs ?? [],
      createdAt: existing?.createdAt ?? nowISO(),
      createdBy: existing?.createdBy ?? currentUser?.id ?? 'u-ana',
    };

    saveService(payload);
    success(
      editing ? 'Escala atualizada' : 'Escala criada',
      `${payload.event} salva no calendário do ministério.`,
    );
    navigate(`/escalas/${serviceId}`);
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 760 }}>
      <PageHeader
        backTo={editing && existing ? `/escalas/${existing.id}` : '/escalas'}
        backLabel={editing ? 'Voltar ao culto' : 'Escalas'}
        title={editing ? 'Editar escala' : 'Nova escala'}
        subtitle={
          editing
            ? 'Ajuste data, horário, observações ou participantes.'
            : 'Defina o culto e escale a equipe no mesmo fluxo.'
        }
        compact
      />

      <form onSubmit={handleSubmit} noValidate>
        <FormSection title="Dados do culto">
          <div className="field-grid">
            <Field
              label="Evento"
              htmlFor="svc-event"
              error={touched ? errors.eventName : undefined}
            >
              <input
                id="svc-event"
                className={`input ${touched && errors.eventName ? 'input--error' : ''}`}
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
                placeholder="Ex.: Culto de Celebração, Santa Ceia..."
              />
            </Field>

            <div className="form-grid-2">
              <Field label="Data" htmlFor="svc-date" error={touched ? errors.date : undefined}>
                <input
                  id="svc-date"
                  type="date"
                  className={`input ${touched && errors.date ? 'input--error' : ''}`}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </Field>
              <Field label="Horário" htmlFor="svc-time" error={touched ? errors.time : undefined}>
                <input
                  id="svc-time"
                  type="time"
                  className={`input ${touched && errors.time ? 'input--error' : ''}`}
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </Field>
            </div>

            <div className="form-grid-2">
              <Field label="Chegada / Ensaio" htmlFor="svc-call" optional>
                <input
                  id="svc-call"
                  type="time"
                  className="input"
                  value={callTime}
                  onChange={(event) => setCallTime(event.target.value)}
                />
              </Field>
              <Field label="Local" htmlFor="svc-location" optional>
                <input
                  id="svc-location"
                  className="input"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Ex.: Templo sede"
                />
              </Field>
            </div>

            {canApprove && (
              <Field label="Situação da escala" htmlFor="svc-status">
                <div className="segmented" role="group" aria-label="Situação da escala" id="svc-status">
                  <button
                    type="button"
                    aria-pressed={status === 'confirmed'}
                    onClick={() => setStatus('confirmed')}
                  >
                    Confirmada
                  </button>
                  <button
                    type="button"
                    aria-pressed={status === 'draft'}
                    onClick={() => setStatus('draft')}
                  >
                    Rascunho
                  </button>
                </div>
              </Field>
            )}

            <Field
              label="Observações"
              htmlFor="svc-notes"
              optional
              hint="Passagem de som, uniforme ou orientações específicas para a equipe."
            >
              <textarea
                id="svc-notes"
                className="textarea"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ex.: Passagem de som 30 minutos antes do início."
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Equipe"
          description="Selecione os membros cadastrados e defina a função de cada um neste culto."
        >
          {availableUsers.length > 0 && (
            <div className="form-grid-2" style={{ marginBottom: 12 }}>
              <Field label="Membro" htmlFor="pick-user">
                <select
                  id="pick-user"
                  className="select"
                  value={pickerUserId || availableUsers[0]?.id || ''}
                  onChange={(event) => {
                    const uid = event.target.value;
                    setPickerUserId(uid);
                    const found = state.users.find((u) => u.id === uid);
                    if (found?.cargos[0]) setPickerRole(found.cargos[0]);
                  }}
                >
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Função neste culto" htmlFor="pick-role">
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    id="pick-role"
                    className="select"
                    value={pickerRole}
                    onChange={(event) => setPickerRole(event.target.value)}
                  >
                    {state.settings.cargos.map((cargo) => (
                      <option key={cargo} value={cargo}>
                        {cargo}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleAddAssignment}
                    aria-label="Adicionar pessoa à equipe"
                  >
                    <Plus size={18} aria-hidden="true" />
                    Adicionar
                  </button>
                </div>
              </Field>
            </div>
          )}

          {assignments.length > 0 ? (
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {assignments.map((assignment) => {
                const user = state.users.find((item) => item.id === assignment.userId);
                if (!user) return null;
                return (
                  <div
                    className="assignment-row"
                    key={`${assignment.userId}-${assignment.role}`}
                  >
                    <Avatar user={user} size="sm" role={assignment.role} />
                    <div className="assignment-row__body">
                      <strong>{user.fullName}</strong>
                      <span>{assignment.role}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 36, height: 36 }}
                      onClick={() => handleRemoveAssignment(assignment.userId)}
                      aria-label={`Remover ${user.fullName}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="small muted">
              Nenhuma pessoa adicionada ainda. Você pode escalar agora ou depois na página do culto.
            </p>
          )}
        </FormSection>

        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button type="submit" className="btn btn--primary">
            {editing ? 'Salvar alterações' : 'Criar escala'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
