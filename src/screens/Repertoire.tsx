import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  Cloud,
  ExternalLink,
  Music2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { hasPermission } from '../lib/permissions';
import type { Provider, Song, SongSource } from '../lib/types';
import { formatShortDate, formatTime, nowISO, todayISO } from '../lib/date';
import { PageHeader, SectionHead } from '../components/PageHeader';
import { DriveMark, OneDriveMark } from '../components/Marks';
import { KeyBadge, SourceChip } from '../components/Chips';
import { Setlist } from '../components/ServiceBits';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { Sheet, useToast } from '../components/Sheet';
import { useConfirm } from '../components/Confirm';

const SCHEMA_FIELDS = [
  { name: 'titulo', type: 'texto', example: 'Aurora da Manhã' },
  { name: 'tom', type: 'texto', example: 'D · G · Bb' },
  { name: 'bpm', type: 'número', example: '72' },
  { name: 'pasta', type: 'caminho', example: 'Celebração / Domingo' },
  { name: 'arquivo_url', type: 'link', example: 'drive.google.com / onedrive.live.com' },
];

export default function Repertoire() {
  const { state, currentUser, saveService, saveSong, deleteSong, updateIntegration, newId } =
    useApp();
  const [params, setParams] = useSearchParams();
  const { success } = useToast();
  const confirm = useConfirm();

  const canManage = hasPermission(currentUser, 'repertoire.manage');
  const canIntegrate = hasPermission(currentUser, 'repertoire.integrations');

  const today = todayISO();
  const orderedServices = useMemo(
    () =>
      [...state.services]
        .filter((service) => service.date >= today)
        .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),
    [state.services, today],
  );

  const requestedServiceId = params.get('service');
  const activeService =
    state.services.find((service) => service.id === requestedServiceId) ??
    orderedServices[0] ??
    state.services[0];

  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | SongSource>('all');

  const [songSheetOpen, setSongSheetOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('G');
  const [bpm, setBpm] = useState('');
  const [source, setSource] = useState<SongSource>('google-drive');
  const [folder, setFolder] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [songError, setSongError] = useState('');

  const [connectProvider, setConnectProvider] = useState<Provider | null>(null);
  const [connectAccount, setConnectAccount] = useState('');
  const [connectFolder, setConnectFolder] = useState('');

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.songs
      .filter((song) => {
        if (sourceFilter !== 'all' && song.source !== sourceFilter) return false;
        if (!q) return true;
        return (
          song.title.toLowerCase().includes(q) ||
          song.artist.toLowerCase().includes(q) ||
          (song.folder ?? '').toLowerCase().includes(q) ||
          song.key.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  }, [state.songs, query, sourceFilter]);

  const linkedSongIds = useMemo(
    () => new Set(activeService?.songs.map((item) => item.songId) ?? []),
    [activeService],
  );

  const handleLinkSong = (song: Song) => {
    if (!activeService || linkedSongIds.has(song.id)) return;
    saveService({
      ...activeService,
      songs: [...activeService.songs, { songId: song.id, key: song.key }],
    });
    success('Vinculada ao culto', `${song.title} adicionada em ${activeService.event}.`);
  };

  const handleUnlinkSong = (songId: string) => {
    if (!activeService) return;
    saveService({
      ...activeService,
      songs: activeService.songs.filter((item) => item.songId !== songId),
    });
    success('Música removida do culto');
  };

  const handleCreateSong = (event: React.FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 2) {
      setSongError('Informe o nome da música.');
      return;
    }
    if (!key.trim()) {
      setSongError('Informe a tonalidade.');
      return;
    }
    const created: Song = {
      id: newId('s'),
      title: title.trim(),
      artist: artist.trim(),
      key: key.trim(),
      bpm: bpm ? Number(bpm) : undefined,
      source,
      folder: folder.trim() || undefined,
      referenceUrl: referenceUrl.trim() || undefined,
      addedAt: nowISO(),
    };
    saveSong(created);
    success('Música cadastrada', `${created.title} (${created.key}) no banco de repertório.`);
    setTitle('');
    setArtist('');
    setKey('G');
    setBpm('');
    setFolder('');
    setReferenceUrl('');
    setSongError('');
    setSongSheetOpen(false);
  };

  const handleDeleteSong = async (song: Song) => {
    const ok = await confirm({
      title: 'Excluir música do banco?',
      description: `${song.title} será removida do banco e dos cultos vinculados.`,
      confirmLabel: 'Excluir',
      tone: 'danger',
    });
    if (!ok) return;
    deleteSong(song.id);
    success('Música removida do banco');
  };

  const openConnect = (provider: Provider) => {
    const current = state.integrations.find((item) => item.provider === provider);
    setConnectProvider(provider);
    setConnectAccount(
      current?.account ??
        (provider === 'google-drive'
          ? 'louvor@adoraplus.demo'
          : 'louvor@adoraplus.onmicrosoft.com'),
    );
    setConnectFolder(current?.folderName ?? 'Repertório — Ministério de Louvor');
  };

  const handleSaveConnection = (event: React.FormEvent) => {
    event.preventDefault();
    if (!connectProvider) return;
    updateIntegration(connectProvider, {
      connected: true,
      account: connectAccount.trim() || 'conta.conectada@demo',
      folderName: connectFolder.trim() || 'Repertório do Ministério',
      lastSync: nowISO(),
      autoSync: true,
    });
    success(
      connectProvider === 'google-drive' ? 'Google Drive conectado' : 'OneDrive conectado',
      'Integração OAuth configurada para sincronizar o banco de músicas.',
    );
    setConnectProvider(null);
  };

  const handleDisconnect = (provider: Provider) => {
    updateIntegration(provider, {
      connected: false,
      autoSync: false,
    });
    success(
      provider === 'google-drive' ? 'Google Drive desconectado' : 'OneDrive desconectado',
    );
  };

  const handleSync = (provider: Provider) => {
    updateIntegration(provider, { lastSync: nowISO() });
    success('Sincronização concluída', 'Lista de referências atualizada.');
  };

  return (
    <div className="page fade-in">
      <PageHeader
        title="Repertório"
        subtitle="Músicas vinculadas aos cultos e conexão externa com Google Drive ou OneDrive."
        actions={
          canManage ? (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setSongSheetOpen(true)}
            >
              <Plus size={16} aria-hidden="true" />
              Nova música
            </button>
          ) : undefined
        }
      />

      {orderedServices.length > 0 && (
        <section aria-label="Selecionar culto">
          <div className="service-chips">
            {orderedServices.map((service) => (
              <button
                key={service.id}
                type="button"
                className="service-chip"
                aria-pressed={activeService?.id === service.id}
                onClick={() => setParams({ service: service.id })}
              >
                <strong>{service.event}</strong>
                <span>
                  {formatShortDate(service.date)} · {formatTime(service.time)} ·{' '}
                  {service.songs.length} mús.
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {activeService && (
        <section className="setlist-card" aria-labelledby="setlist-active-title">
          <div className="setlist-card__head">
            <div>
              <h2 id="setlist-active-title">{activeService.event}</h2>
              <p>
                {formatShortDate(activeService.date)} · {formatTime(activeService.time)} ·{' '}
                {activeService.songs.length}{' '}
                {activeService.songs.length === 1 ? 'música' : 'músicas'}
              </p>
            </div>
            <Link to={`/escalas/${activeService.id}`} className="btn btn--ghost btn--sm">
              Ver escala
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </div>
          <Setlist
            service={activeService}
            actions={
              canManage
                ? (song) => (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => handleUnlinkSong(song.id)}
                      aria-label={`Remover ${song.title} deste culto`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )
                : undefined
            }
          />
        </section>
      )}

      <div className="rep-grid">
        <section aria-labelledby="library-title">
          <SectionHead
            title="Banco de músicas"
            count={filteredSongs.length}
            description="Referências externas (Drive / OneDrive) e cadastro rápido para vincular às escalas."
          />

          <div className="toolbar">
            <div className="search">
              <Search aria-hidden="true" />
              <input
                type="search"
                className="input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar título, pasta ou tom..."
                aria-label="Buscar músicas"
              />
            </div>
            <div className="segmented" role="group" aria-label="Filtrar origem">
              {(
                [
                  ['all', 'Todas'],
                  ['google-drive', 'Drive'],
                  ['onedrive', 'OneDrive'],
                  ['manual', 'Manual'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={sourceFilter === value}
                  onClick={() => setSourceFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredSongs.length > 0 ? (
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {filteredSongs.map((song) => {
                const isLinked = linkedSongIds.has(song.id);
                return (
                  <div className="db-song" key={song.id}>
                    <div className="db-song__body">
                      <strong>{song.title}</strong>
                      <span>
                        {song.folder ? `${song.folder} · ` : ''}
                        {song.bpm ? `${song.bpm} bpm · ` : ''}
                        {song.artist || 'Ministério'}
                      </span>
                    </div>
                    <SourceChip source={song.source} />
                    <KeyBadge musicKey={song.key} />
                    {canManage && activeService && (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        disabled={isLinked}
                        onClick={() => handleLinkSong(song)}
                        aria-label={`Vincular ${song.title} ao culto`}
                      >
                        {isLinked ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
                        {isLinked ? 'No culto' : 'Vincular'}
                      </button>
                    )}
                    {canManage && (
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 34, height: 34 }}
                        onClick={() => handleDeleteSong(song)}
                        aria-label={`Excluir ${song.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Music2}
              title="Nenhuma música encontrada"
              description="Ajuste os filtros ou cadastre uma nova música no banco."
              compact
            />
          )}
        </section>

        <section aria-labelledby="integrations-title">
          <SectionHead
            title="Armazenamento externo"
            description="As músicas permanecem na nuvem do ministério. Conecte via OAuth."
          />

          <div className="provider-grid" id="integrations-title">
            {state.integrations.map((integration) => {
              const isDrive = integration.provider === 'google-drive';
              const label = isDrive ? 'Google Drive' : 'OneDrive';
              return (
                <div
                  key={integration.provider}
                  className={`provider ${integration.connected ? 'is-active' : ''}`}
                >
                  <span className="provider__logo" aria-hidden="true">
                    {isDrive ? <DriveMark /> : <OneDriveMark />}
                  </span>
                  <div className="provider__body">
                    <strong>{label}</strong>
                    <span>
                      {integration.connected
                        ? `${integration.folderName ?? 'Pasta conectada'} · ${integration.account}`
                        : 'Não conectado · autenticação OAuth 2.0'}
                    </span>
                  </div>
                  {integration.connected ? (
                    <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
                      {canIntegrate && (
                        <>
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: 36, height: 36 }}
                            onClick={() => handleSync(integration.provider)}
                            aria-label={`Sincronizar ${label}`}
                            title="Sincronizar"
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => handleDisconnect(integration.provider)}
                          >
                            Desconectar
                          </button>
                        </>
                      )}
                      {!canIntegrate && (
                        <span className="connect-strip__ok">
                          <CheckCircle2 size={14} aria-hidden="true" />
                          ativo
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={!canIntegrate}
                      onClick={() => openConnect(integration.provider)}
                    >
                      Conectar
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="db-note" style={{ marginTop: 14 }}>
            <Cloud aria-hidden="true" />
            <span>
              Os arquivos de cifra, letra e áudio não são duplicados localmente. O Adora+ armazena
              apenas o vínculo OAuth e os metadados da pasta configurada.
            </span>
          </div>

          <div style={{ marginTop: 22 }}>
            <p className="permission-group__title">Estrutura base do banco de músicas</p>
            <div className="schema">
              <div className="schema__row schema__row--head">
                <span>Campo</span>
                <span>Tipo</span>
                <span>Exemplo</span>
              </div>
              {SCHEMA_FIELDS.map((field) => (
                <div className="schema__row" key={field.name}>
                  <span className="schema__name">{field.name}</span>
                  <span className="schema__type">{field.type}</span>
                  <span className="schema__example">{field.example}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Sheet
        open={songSheetOpen}
        onClose={() => setSongSheetOpen(false)}
        title="Nova música"
        description="Adicione uma referência ao banco do ministério."
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setSongSheetOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" form="new-song-form" className="btn btn--primary">
              Salvar música
            </button>
          </>
        }
      >
        <form id="new-song-form" className="field-grid" onSubmit={handleCreateSong} noValidate>
          <Field label="Título" htmlFor="new-song-title" error={songError || undefined}>
            <input
              id="new-song-title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Santo, Santo, Santo"
              data-autofocus
            />
          </Field>
          <Field label="Artista / Ministério" htmlFor="new-song-artist" optional>
            <input
              id="new-song-artist"
              className="input"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="Ex.: Comunidade Salmo"
            />
          </Field>
          <div className="form-grid-2">
            <Field label="Tom padrão" htmlFor="new-song-key">
              <input
                id="new-song-key"
                className="input"
                value={key}
                onChange={(event) => setKey(event.target.value)}
                placeholder="Ex.: G"
              />
            </Field>
            <Field label="BPM" htmlFor="new-song-bpm" optional>
              <input
                id="new-song-bpm"
                className="input"
                inputMode="numeric"
                value={bpm}
                onChange={(event) => setBpm(event.target.value.replace(/\D/g, ''))}
                placeholder="72"
              />
            </Field>
          </div>
          <Field label="Origem do arquivo" htmlFor="new-song-source">
            <select
              id="new-song-source"
              className="select"
              value={source}
              onChange={(event) => setSource(event.target.value as SongSource)}
            >
              <option value="google-drive">Google Drive</option>
              <option value="onedrive">OneDrive</option>
              <option value="manual">Cadastro manual</option>
            </select>
          </Field>
          <Field label="Pasta" htmlFor="new-song-folder" optional>
            <input
              id="new-song-folder"
              className="input"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              placeholder="Ex.: Celebração / Domingo"
            />
          </Field>
          <Field label="Link de referência" htmlFor="new-song-url" optional>
            <input
              id="new-song-url"
              type="url"
              className="input"
              value={referenceUrl}
              onChange={(event) => setReferenceUrl(event.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </Field>
        </form>
      </Sheet>

      <Sheet
        open={Boolean(connectProvider)}
        onClose={() => setConnectProvider(null)}
        title={
          connectProvider === 'google-drive'
            ? 'Conectar Google Drive (OAuth)'
            : 'Conectar OneDrive (OAuth)'
        }
        description="Configure a conta e a pasta raiz que armazena o banco de músicas."
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setConnectProvider(null)}
            >
              Cancelar
            </button>
            <button type="submit" form="connect-provider-form" className="btn btn--primary">
              Autorizar e conectar
            </button>
          </>
        }
      >
        <form id="connect-provider-form" className="field-grid" onSubmit={handleSaveConnection}>
          <Field
            label="Conta OAuth"
            htmlFor="conn-account"
            hint="Em produção, o login abre o consentimento OAuth 2.0 do provedor."
          >
            <input
              id="conn-account"
              type="email"
              className="input"
              value={connectAccount}
              onChange={(event) => setConnectAccount(event.target.value)}
              required
            />
          </Field>
          <Field label="Pasta do repertório" htmlFor="conn-folder">
            <input
              id="conn-folder"
              className="input"
              value={connectFolder}
              onChange={(event) => setConnectFolder(event.target.value)}
              required
            />
          </Field>
        </form>
      </Sheet>
    </div>
  );
}
