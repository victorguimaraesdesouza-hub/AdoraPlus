import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, ShieldCheck } from 'lucide-react';
import { assignmentsFor, useApp } from '../lib/store';
import { PERMISSIONS, detectRolePreset, hasPermission } from '../lib/permissions';
import { UNCOES, ageFrom, type Sex, type Uncao } from '../lib/types';
import { todayISO } from '../lib/date';
import { PageHeader, SectionHead } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { Field, FormSection } from '../components/Field';
import { UpcomingRow } from '../components/ServiceBits';
import { useToast } from '../components/Sheet';

export default function Profile() {
  const { state, currentUser, updateUser, signOut } = useApp();
  const { success } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(currentUser?.fullName ?? '');
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate ?? '');
  const [sex, setSex] = useState<Sex>(currentUser?.sex ?? 'masculino');
  const [uncao, setUncao] = useState<Uncao>(currentUser?.uncao ?? 'Sem Unção');
  const [cargos, setCargos] = useState<string[]>(currentUser?.cargos ?? []);
  const [touched, setTouched] = useState(false);

  const today = todayISO();
  const myUpcoming = useMemo(() => {
    if (!currentUser) return [];
    return assignmentsFor(currentUser.id, state.services)
      .filter((entry) => entry.service.date >= today)
      .sort((a, b) =>
        `${a.service.date}T${a.service.time}`.localeCompare(`${b.service.date}T${b.service.time}`),
      );
  }, [currentUser, state.services, today]);

  if (!currentUser) return null;

  const errors = {
    fullName: fullName.trim().length < 3 ? 'Informe seu nome completo.' : '',
    birthDate: !birthDate
      ? 'Informe sua data de nascimento.'
      : ageFrom(birthDate) < 12
        ? 'Data de nascimento inválida.'
        : '',
    cargos: cargos.length === 0 ? 'Selecione ao menos um cargo.' : '',
  };

  const toggleCargo = (cargo: string) => {
    setCargos((current) =>
      current.includes(cargo) ? current.filter((item) => item !== cargo) : [...current, cargo],
    );
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (errors.fullName || errors.birthDate || errors.cargos) return;
    updateUser(currentUser.id, {
      fullName: fullName.trim(),
      birthDate,
      sex,
      uncao,
      cargos,
    });
    success('Perfil atualizado', 'Seus dados já aparecem atualizados na escala.');
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  const preset = detectRolePreset(currentUser);
  const activePermissions = PERMISSIONS.filter((permission) =>
    hasPermission(currentUser, permission.key),
  );

  return (
    <div className="page fade-in" style={{ maxWidth: 780 }}>
      <PageHeader
        title="Meu perfil"
        subtitle="Seus dados cadastrais preenchidos manualmente. O nome nunca é sobrescrito pela conta Google."
      />

      <div className="profile-card">
        <Avatar user={currentUser} size="lg" />
        <div className="profile-card__body">
          <h1>{currentUser.fullName}</h1>
          <p>
            {currentUser.uncao} · {currentUser.email}
          </p>
          <div className="chip-row" style={{ marginTop: 10 }}>
            <span className="chip chip--amber">
              <ShieldCheck size={13} aria-hidden="true" />
              Nível: {preset === 'admin' ? 'Admin' : preset === 'editor' ? 'Editor' : preset === 'membro' ? 'Membro' : 'Personalizado'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ marginTop: 26 }} noValidate>
        <FormSection title="Informações pessoais">
          <div className="field-grid">
            <Field
              label="Nome completo"
              htmlFor="prof-name"
              error={touched ? errors.fullName : undefined}
            >
              <input
                id="prof-name"
                className={`input ${touched && errors.fullName ? 'input--error' : ''}`}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </Field>

            <div className="form-grid-2">
              <Field
                label="Data de nascimento"
                htmlFor="prof-birth"
                error={touched ? errors.birthDate : undefined}
              >
                <input
                  id="prof-birth"
                  type="date"
                  className={`input ${touched && errors.birthDate ? 'input--error' : ''}`}
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </Field>
              <Field label="Sexo" htmlFor="prof-sex">
                <div className="segmented" role="group" aria-label="Sexo" id="prof-sex">
                  {(['feminino', 'masculino'] as Sex[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={sex === option}
                      onClick={() => setSex(option)}
                    >
                      {option === 'feminino' ? 'Feminino' : 'Masculino'}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <Field label="Unção" htmlFor="prof-uncao">
              <select
                id="prof-uncao"
                className="select"
                value={uncao}
                onChange={(event) => setUncao(event.target.value as Uncao)}
              >
                {UNCOES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Cargos no louvor"
              htmlFor="prof-cargos"
              error={touched ? errors.cargos : undefined}
            >
              <div className="option-grid" role="group" aria-label="Cargos" id="prof-cargos">
                {state.settings.cargos.map((cargo) => (
                  <button
                    key={cargo}
                    type="button"
                    className="option"
                    aria-pressed={cargos.includes(cargo)}
                    onClick={() => toggleCargo(cargo)}
                  >
                    {cargo}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn--primary">
              <Save size={16} aria-hidden="true" />
              Salvar alterações
            </button>
          </div>
        </FormSection>
      </form>

      <section className="section">
        <SectionHead
          title="Suas próximas escalas"
          count={myUpcoming.length}
          description="Cultos em que você está escalado."
        />
        {myUpcoming.length > 0 ? (
          <div className="rowlist">
            {myUpcoming.map(({ service }) => (
              <UpcomingRow key={service.id} service={service} mine />
            ))}
          </div>
        ) : (
          <p className="small muted">Você não está escalado nos próximos cultos.</p>
        )}
      </section>

      <section className="section">
        <SectionHead
          title="Suas permissões"
          count={activePermissions.length}
          description="Atribuídas pela administração do ministério."
        />
        {activePermissions.length > 0 ? (
          <div className="chip-row">
            {activePermissions.map((permission) => (
              <span className="chip" key={permission.key}>
                {permission.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="small muted">
            Perfil de membro: acesso ao calendário, escalas confirmadas, avisos e repertório.
          </p>
        )}
      </section>

      <div style={{ marginTop: 34, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <button type="button" className="btn btn--ghost" onClick={handleSignOut}>
          <LogOut size={16} aria-hidden="true" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
