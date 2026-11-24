import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  Music2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { hasPermission } from '../lib/permissions';
import { formatLongDate, formatTime, relativeDay } from '../lib/date';
import { roleRank, sortRoles } from '../lib/roles';
import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { StatusChip } from '../components/Chips';
import { ScoreMark } from '../components/Marks';
import { Setlist } from '../components/ServiceBits';
import { Field } from '../components/Field';
import { Sheet, useToast } from '../components/Sheet';
import { useConfirm } from '../components/Confirm';
import { EmptyState } from '../components/EmptyState';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, currentUser, saveService, deleteService } = useApp();
  const { success } = useToast();
  const confirm = useConfirm();

  const service = state.services.find((item) => item.id === id);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const [addSongOpen, setAddSongOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [songKey, setSongKey] = useState('');

  const canEdit = hasPermission(currentUser, 'scales.edit');
  const canDelete = hasPermission(currentUser, 'scales.delete');
  const canApprove = hasPermission(currentUser, 'scales.approve');
  const canManageRepertoire = hasPermission(currentUser, 'repertoire.manage');

  const availableUsers = useMemo(() => {
    if (!service) return [];
    const assigned = new Set(service.assignments.map((item) => item.userId));
    return state.users
      .filter((user) => user.active && !assigned.has(user.id))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR'));
  }, [service, state.users]);

  const availableSongs = useMemo(() => {
    if (!service) return [];
    const linked = new Set(service.songs.map((item) => item.songId));
    return state.songs
      .filter((song) => !linked.has(song.id))
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  }, [service, state.songs]);

  if (!service) {
    return (
      <div className="page">
        <EmptyState
          icon={Users}
          title="Escala não encontrada"
          description="Ela pode ter sido removida ou o link está incorreto."
          action={
            <Link to="/escalas" className="btn btn--ghost btn--sm">
              Voltar para escalas
            </Link>
          }
        />
      </div>
    );
  }

  const orderedAssignments = sortRoles(service.assignments);
  const myAssignment = service.assignments.find((item) => item.userId === currentUser?.id);

  const openAddMember = () => {
    const first = availableUsers[0];
    setSelectedUserId(first?.id ?? '');
    setSelectedRole(first?.cargos[0] ?? state.settings.cargos[0] ?? 'Backing Vocal');
    setAddMemberOpen(true);
  };

  const handleAddMember = () => {
    if (!selectedUserId || !selectedRole) return;
    saveService({
      ...service,
      assignments: [...service.assignments, { userId: selectedUserId, role: selectedRole }],
    });
    const added = state.users.find((user) => user.id === selectedUserId);
    success('Pessoa escalada', `${added?.fullName ?? 'Membro'} como ${selectedRole}.`);
    setAddMemberOpen(false);
  };

  const handleRemoveMember = (userId: string) => {
    saveService({
      ...service,
      assignments: service.assignments.filter((item) => item.userId !== userId),
    });
    success('Participante removido da escala');
  };

  const openAddSong = () => {
    const first = availableSongs[0];
    setSelectedSongId(first?.id ?? '');
    setSongKey(first?.key ?? 'G');
    setAddSongOpen(true);
  };

  const handleAddSong = () => {
    if (!selectedSongId || !songKey.trim()) return;
    saveService({
      ...service,
      songs: [...service.songs, { songId: selectedSongId, key: songKey.trim() }],
    });
    const added = state.songs.find((song) => song.id === selectedSongId);
    success('Música vinculada', `${added?.title ?? 'Música'} no tom ${songKey.trim()}.`);
    setAddSongOpen(false);
  };

  const handleRemoveSong = (songId: string) => {
    saveService({
      ...service,
      songs: service.songs.filter((item) => item.songId !== songId),
    });
    success('Música removida do culto');
  };

  const handleMoveSong = (songId: string, delta: -1 | 1) => {
    const index = service.songs.findIndex((item) => item.songId === songId);
    const nextIndex = index + delta;
    if (index < 0 || nextIndex < 0 || nextIndex >= service.songs.length) return;
    const reordered = [...service.songs];
    const [item] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, item);
    saveService({ ...service, songs: reordered });
  };

  const handleToggleStatus = () => {
    const nextStatus = service.status === 'confirmed' ? 'draft' : 'confirmed';
    saveService({ ...service, status: nextStatus });
    success(
      nextStatus === 'confirmed' ? 'Escala confirmada' : 'Escala movida para rascunho',
      nextStatus === 'confirmed'
        ? 'A equipe agora vê esta escala como confirmada.'
        : 'A escala voltou ao modo rascunho.',
    );
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Excluir esta escala?',
      description: `${service.event} · ${formatLongDate(service.date)} às ${formatTime(service.time)}.`,
      confirmLabel: 'Excluir escala',
      tone: 'danger',
    });
    if (!ok) return;
    deleteService(service.id);
    success('Escala excluída');
    navigate('/escalas', { replace: true });
  };

  return (
    <div className="page fade-in">
      <PageHeader
        backTo="/escalas"
        backLabel="Escalas"
        title={service.event}
        subtitle={`${formatLongDate(service.date)} · ${formatTime(service.time)}`}
        actions={
          <>
            {canApprove && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={handleToggleStatus}
              >
                <CheckCircle2 size={15} aria-hidden="true" />
                {service.status === 'confirmed' ? 'Voltar para rascunho' : 'Aprovar escala'}
              </button>
            )}
            {canEdit && (
              <Link to={`/escalas/${service.id}/editar`} className="btn btn--primary btn--sm">
                <Pencil size={15} aria-hidden="true" />
                Editar
              </Link>
            )}
          </>
        }
      >
        <div className="chip-row" style={{ marginTop: 12 }}>
          <StatusChip status={service.status} />
          <span className="chip chip--amber">{relativeDay(service.date)}</span>
          {service.callTime && (
            <span className="chip">
              <Clock3 size={13} aria-hidden="true" />
              Chegada {formatTime(service.callTime)}
            </span>
          )}
          {service.location && (
            <span className="chip">
              <MapPin size={13} aria-hidden="true" />
              {service.location}
            </span>
          )}
          <span className="chip">
            <Users size={13} aria-hidden="true" />
            {service.assignments.length}{' '}
            {service.assignments.length === 1 ? 'pessoa' : 'pessoas'}
          </span>
          <span className="chip">
            <Music2 size={13} aria-hidden="true" />
            {service.songs.length} {service.songs.length === 1 ? 'música' : 'músicas'}
          </span>
        </div>
      </PageHeader>

      {myAssignment && (
        <div className="hero__seal" style={{ marginTop: 0, marginBottom: 18 }}>
          <span className="note-dot" aria-hidden="true" />
          Você está {currentUser?.sex === 'feminino' ? 'escalada' : 'escalado'} como{' '}
          <strong>{myAssignment.role}</strong>
        </div>
      )}

      {service.notes && (
        <div className="detail-note" style={{ marginTop: 0 }}>
          <Info size={16} aria-hidden="true" />
          <p>{service.notes}</p>
        </div>
      )}

      <div className="detail-grid">
        <section className="detail-block" aria-labelledby="team-title">
          <div className="detail-block__head">
            <h2 id="team-title">Equipe</h2>
            {canEdit && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={openAddMember}>
                <UserPlus size={15} aria-hidden="true" />
                Escalar pessoa
              </button>
            )}
          </div>

          {orderedAssignments.length > 0 ? (
            <div style={{ marginTop: 6 }}>
              {orderedAssignments.map((assignment, index) => {
                const user = state.users.find((item) => item.id === assignment.userId);
                if (!user) return null;
                return (
                  <div
                    className="assignment-row"
                    key={`${assignment.userId}-${assignment.role}`}
                  >
                    <ScoreMark role={assignment.role} position={roleRank(assignment.role) + index} />
                    <Avatar user={user} size="sm" role={assignment.role} />
                    <div className="assignment-row__body">
                      <strong>{user.fullName}</strong>
                      <span>
                        {assignment.role} · {user.uncao}
                      </span>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 36, height: 36 }}
                        onClick={() => handleRemoveMember(assignment.userId)}
                        aria-label={`Remover ${user.fullName} da escala`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="team-empty">Ninguém escalado ainda para este culto.</p>
          )}
        </section>

        <section className="detail-block" id="repertorio" aria-labelledby="set-title">
          <div className="detail-block__head">
            <h2 id="set-title">Repertório</h2>
            {canManageRepertoire && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={openAddSong}>
                <Plus size={15} aria-hidden="true" />
                Vincular música
              </button>
            )}
          </div>

          <Setlist
            service={service}
            actions={
              canManageRepertoire
                ? (song) => {
                    const idx = service.songs.findIndex((item) => item.songId === song.id);
                    return (
                      <>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => handleMoveSong(song.id, -1)}
                          aria-label={`Subir ${song.title}`}
                          disabled={idx <= 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => handleMoveSong(song.id, 1)}
                          aria-label={`Descer ${song.title}`}
                          disabled={idx === service.songs.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => handleRemoveSong(song.id)}
                          aria-label={`Remover ${song.title} deste culto`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    );
                  }
                : undefined
            }
          />

          <div className="repertoire-meta">
            <span>
              {service.songs.length} {service.songs.length === 1 ? 'música' : 'músicas'} no culto
            </span>
            <Link to={`/repertorio?service=${service.id}`} className="link-inline">
              Abrir no repertório
            </Link>
          </div>
        </section>
      </div>

      {canDelete && (
        <div className="detail-danger">
          <div>
            <strong>Excluir esta escala</strong>
            <p>Remove o culto do calendário para toda a equipe. Esta ação não pode ser desfeita.</p>
          </div>
          <button type="button" className="btn btn--danger btn--sm" onClick={handleDelete}>
            <Trash2 size={15} aria-hidden="true" />
            Excluir
          </button>
        </div>
      )}

      <Sheet
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Escalar pessoa"
        description={`${service.event} · ${formatLongDate(service.date)}`}
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setAddMemberOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAddMember}
              disabled={!selectedUserId || !selectedRole}
            >
              Escalar
            </button>
          </>
        }
      >
        {availableUsers.length > 0 ? (
          <div className="field-grid">
            <Field label="Pessoa" htmlFor="assign-user">
              <select
                id="assign-user"
                className="select"
                value={selectedUserId}
                onChange={(event) => {
                  const uid = event.target.value;
                  setSelectedUserId(uid);
                  const found = state.users.find((u) => u.id === uid);
                  if (found?.cargos[0]) setSelectedRole(found.cargos[0]);
                }}
              >
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} · {user.cargos.join(', ') || user.uncao}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Função neste culto"
              htmlFor="assign-role"
              hint="Escolha qual cargo a pessoa exercerá nesta escala."
            >
              <select
                id="assign-role"
                className="select"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
              >
                {state.settings.cargos.map((cargo) => (
                  <option key={cargo} value={cargo}>
                    {cargo}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ) : (
          <p className="small muted">Todos os membros ativos já estão escalados neste culto.</p>
        )}
      </Sheet>

      <Sheet
        open={addSongOpen}
        onClose={() => setAddSongOpen(false)}
        title="Vincular música"
        description="Escolha uma música do banco de repertório e confirme o tom para este culto."
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setAddSongOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAddSong}
              disabled={!selectedSongId || !songKey.trim()}
            >
              Vincular
            </button>
          </>
        }
      >
        {availableSongs.length > 0 ? (
          <div className="field-grid">
            <Field label="Música" htmlFor="link-song">
              <select
                id="link-song"
                className="select"
                value={selectedSongId}
                onChange={(event) => {
                  const sid = event.target.value;
                  setSelectedSongId(sid);
                  const found = state.songs.find((s) => s.id === sid);
                  if (found) setSongKey(found.key);
                }}
              >
                {availableSongs.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.title} ({song.key})
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Tom neste culto"
              htmlFor="link-song-key"
              hint="Pode manter o tom original ou adaptar para quem ministra."
            >
              <input
                id="link-song-key"
                className="input"
                value={songKey}
                onChange={(event) => setSongKey(event.target.value)}
                placeholder="Ex.: G, D, Bb"
              />
            </Field>
          </div>
        ) : (
          <p className="small muted">
            Todas as músicas do banco já estão neste culto. Você pode cadastrar novas músicas na
            área de Repertório.
          </p>
        )}
      </Sheet>
    </div>
  );
}
