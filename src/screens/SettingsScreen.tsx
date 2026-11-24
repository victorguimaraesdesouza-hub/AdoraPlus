import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Shield,
  X,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { ROLE_PRESETS, hasPermission, isAdmin } from '../lib/permissions';
import type { Provider, ThemeMode } from '../lib/types';
import { nowISO } from '../lib/date';
import { PageHeader } from '../components/PageHeader';
import { DriveMark, OneDriveMark } from '../components/Marks';
import { Field, FormSection } from '../components/Field';
import { useToast } from '../components/Sheet';
import { useConfirm } from '../components/Confirm';

export default function SettingsScreen() {
  const {
    state,
    currentUser,
    updateIntegration,
    patchSettings,
    addCargo,
    removeCargo,
    resetDemo,
  } = useApp();
  const { success } = useToast();
  const confirm = useConfirm();

  const admin = isAdmin(currentUser);
  const canIntegrate = hasPermission(currentUser, 'repertoire.integrations');
  const canViewUsers = hasPermission(currentUser, 'users.view');

  const [churchName, setChurchName] = useState(state.settings.churchName);
  const [newCargo, setNewCargo] = useState('');

  const handleSaveGeneral = (event: React.FormEvent) => {
    event.preventDefault();
    if (!churchName.trim()) return;
    patchSettings({ churchName: churchName.trim() });
    success('Configurações salvas', 'Nome do ministério atualizado.');
  };

  const handleAddCargo = (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = newCargo.trim();
    if (cleaned.length < 2) return;
    addCargo(cleaned);
    setNewCargo('');
    success('Cargo adicionado', `${cleaned} agora aparece no cadastro e nas escalas.`);
  };

  const handleRemoveCargo = async (cargo: string) => {
    const ok = await confirm({
      title: `Remover cargo "${cargo}"?`,
      description: 'Membros com este cargo terão o item removido do perfil.',
      confirmLabel: 'Remover cargo',
      tone: 'danger',
    });
    if (!ok) return;
    removeCargo(cargo);
    success('Cargo removido');
  };

  const toggleProvider = (provider: Provider, currentlyConnected: boolean) => {
    if (!canIntegrate) return;
    if (currentlyConnected) {
      updateIntegration(provider, { connected: false, autoSync: false });
      success(provider === 'google-drive' ? 'Google Drive desconectado' : 'OneDrive desconectado');
    } else {
      updateIntegration(provider, {
        connected: true,
        account:
          provider === 'google-drive'
            ? 'louvor@adoraplus.demo'
            : 'louvor@adoraplus.onmicrosoft.com',
        folderName: 'Repertório — Ministério de Louvor',
        lastSync: nowISO(),
        autoSync: true,
      });
      success(provider === 'google-drive' ? 'Google Drive conectado' : 'OneDrive conectado');
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Restaurar dados de demonstração?',
      description: 'Todas as alterações locais neste navegador voltarão ao estado inicial.',
      confirmLabel: 'Restaurar',
      tone: 'danger',
    });
    if (!ok) return;
    resetDemo();
    success('Dados restaurados');
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 780 }}>
      <PageHeader
        title="Configurações"
        subtitle="Aparência, integrações de nuvem, cargos expansíveis, permissões e preferências gerais."
      />

      <FormSection
        title="Aparência e tema"
        description="Escolha entre Escuro, Claro ou Suave — aplicado imediatamente em todo o sistema."
      >
        <div className="theme-cards" role="group" aria-label="Selecionar tema">
          {(
            [
              {
                id: 'dark',
                label: 'Escuro',
                description: 'Alto contraste noturno inspirado no BrainChain.',
              },
              {
                id: 'light',
                label: 'Claro',
                description: 'Superfície clara e limpa para uso sob luz forte.',
              },
              {
                id: 'soft',
                label: 'Suave',
                description: 'Tons quentes e neutros com menor brilho na leitura.',
              },
            ] as Array<{ id: ThemeMode; label: string; description: string }>
          ).map((option) => {
            const active = (state.settings.theme ?? 'dark') === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className="theme-card"
                aria-pressed={active}
                onClick={() => {
                  patchSettings({ theme: option.id });
                  success(`Tema ${option.label} ativado`);
                }}
              >
                <div
                  className={`theme-card__preview theme-card__preview--${option.id}`}
                  aria-hidden="true"
                >
                  <div className="theme-card__bar" />
                  <div className="theme-card__bar" />
                </div>
                <div>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </FormSection>

      <FormSection
        title="Integrações de repertório (OAuth)"
        description="Conecte Google Drive ou OneDrive para sincronizar as pastas de músicas."
      >
        <div className="provider-grid">
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
                      ? `${integration.folderName ?? 'Conectado'} · ${integration.account}`
                      : 'Desconectado · OAuth 2.0 gratuito'}
                  </span>
                </div>
                {canIntegrate && (
                  <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
                    {integration.connected && (
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 36, height: 36 }}
                        onClick={() => {
                          updateIntegration(integration.provider, { lastSync: nowISO() });
                          success('Sincronizado', `${label} atualizado.`);
                        }}
                        aria-label={`Sincronizar ${label}`}
                      >
                        <RefreshCw size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => toggleProvider(integration.provider, integration.connected)}
                    >
                      {integration.connected ? 'Desconectar' : 'Conectar'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FormSection>

      <FormSection
        title="Cargos do ministério"
        description="Lista expansível utilizada no cadastro de membros e na montagem das escalas."
      >
        <div className="cargo-pill-list">
          {state.settings.cargos.map((cargo) => (
            <span className="cargo-pill" key={cargo}>
              {cargo}
              {admin && (
                <button
                  type="button"
                  onClick={() => handleRemoveCargo(cargo)}
                  aria-label={`Remover cargo ${cargo}`}
                >
                  <X size={13} />
                </button>
              )}
            </span>
          ))}
        </div>

        {admin && (
          <form className="inline-add" onSubmit={handleAddCargo}>
            <input
              className="input"
              value={newCargo}
              onChange={(event) => setNewCargo(event.target.value)}
              placeholder="Adicionar novo cargo (ex.: Percussão, Mesa de Som)..."
              aria-label="Novo cargo"
            />
            <button type="submit" className="btn btn--primary" disabled={newCargo.trim().length < 2}>
              <Plus size={16} aria-hidden="true" />
              Incluir
            </button>
          </form>
        )}
      </FormSection>

      <FormSection
        title="Estrutura de permissões"
        description="Níveis padrão do sistema. As regras podem ser refinadas por membro."
      >
        <div className="preset-grid">
          {ROLE_PRESETS.map((preset) => (
            <div className="preset-card" key={preset.id}>
              <strong>
                <Shield size={13} aria-hidden="true" style={{ display: 'inline', marginRight: 5 }} />
                {preset.label}
              </strong>
              <span>{preset.description}</span>
            </div>
          ))}
        </div>

        {canViewUsers && (
          <div style={{ marginTop: 14 }}>
            <Link to="/usuarios" className="settings-row">
              <div>
                <strong>Gerenciar permissões por pessoa</strong>
                <span>Visualizar todos os perfis cadastrados e delegar acessos.</span>
              </div>
              <ChevronRight aria-hidden="true" />
            </Link>
          </div>
        )}
      </FormSection>

      <FormSection title="Configurações gerais">
        <form onSubmit={handleSaveGeneral} className="field-grid">
          <Field label="Nome do ministério / igreja" htmlFor="cfg-church">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="cfg-church"
                className="input"
                value={churchName}
                onChange={(event) => setChurchName(event.target.value)}
                disabled={!admin}
              />
              {admin && (
                <button type="submit" className="btn btn--ghost">
                  <Save size={16} aria-hidden="true" />
                  Salvar
                </button>
              )}
            </div>
          </Field>
        </form>

        <div style={{ marginTop: 18 }}>
          <div className="toggle-row">
            <div className="toggle-row__body">
              <strong>Lembrete antes do culto</strong>
              <span>Destacar avisos de participação 24h antes da escala.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state.settings.notifications.serviceReminder}
              aria-label="Lembrete antes do culto"
              className="switch"
              onClick={() =>
                patchSettings({
                  notifications: {
                    ...state.settings.notifications,
                    serviceReminder: !state.settings.notifications.serviceReminder,
                  },
                })
              }
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-row__body">
              <strong>Alterações na escala</strong>
              <span>Notificar quando houver mudança de horário ou substituição.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state.settings.notifications.changes}
              aria-label="Alterações na escala"
              className="switch"
              onClick={() =>
                patchSettings({
                  notifications: {
                    ...state.settings.notifications,
                    changes: !state.settings.notifications.changes,
                  },
                })
              }
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-row__body">
              <strong>Resumo semanal</strong>
              <span>Consolidado da programação no início de cada semana.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state.settings.notifications.weeklySummary}
              aria-label="Resumo semanal"
              className="switch"
              onClick={() =>
                patchSettings({
                  notifications: {
                    ...state.settings.notifications,
                    weeklySummary: !state.settings.notifications.weeklySummary,
                  },
                })
              }
            />
          </div>
        </div>
      </FormSection>

      <div className="detail-danger">
        <div>
          <strong>Restaurar ambiente de demonstração</strong>
          <p>Recria os dados fictícios iniciais salvos localmente neste navegador.</p>
        </div>
        <button type="button" className="btn btn--danger btn--sm" onClick={handleReset}>
          <RotateCcw size={15} aria-hidden="true" />
          Restaurar
        </button>
      </div>
    </div>
  );
}
