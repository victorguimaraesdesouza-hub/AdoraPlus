import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, ShieldCheck } from 'lucide-react';
import { useApp } from '../lib/store';
import { UNCOES, ageFrom, type Sex, type Uncao } from '../lib/types';
import { GoogleMark } from '../components/Marks';
import { Logo } from '../components/Logo';
import { Field } from '../components/Field';
import { useToast } from '../components/Sheet';

export default function Onboarding() {
  const { state, completeProfile } = useApp();
  const { success } = useToast();
  const navigate = useNavigate();
  const email = state.pendingEmail ?? '';

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<Sex | ''>('');
  const [uncao, setUncao] = useState<Uncao>('Sem Unção');
  const [cargos, setCargos] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 3) next.fullName = 'Informe seu nome completo.';
    if (!birthDate) next.birthDate = 'Informe sua data de nascimento.';
    else if (ageFrom(birthDate) < 12) next.birthDate = 'A data de nascimento parece incorreta.';
    if (!sex) next.sex = 'Escolha uma opção.';
    if (!cargos.length) next.cargos = 'Escolha pelo menos um cargo no louvor.';
    return next;
  }, [fullName, birthDate, sex, cargos]);

  const toggleCargo = (cargo: string) => {
    setCargos((current) =>
      current.includes(cargo) ? current.filter((item) => item !== cargo) : [...current, cargo],
    );
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length || !sex) return;
    completeProfile({
      email,
      fullName: fullName.trim(),
      birthDate,
      sex,
      uncao,
      cargos,
    });
    success('Perfil criado', 'Bem-vindo ao Adora+. Seu perfil já está na escala do ministério.');
    navigate('/');
  };

  return (
    <div>
      <header className="topbar topbar--auth">
        <Logo />
        <Link to="/login" className="btn btn--quiet btn--sm">
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar
        </Link>
      </header>

      <div className="onboard">
        <div className="onboard__head">
          <div className="chip chip--amber chip--verified">
            <GoogleMark />
            Conta Google verificada
          </div>
          <h1>Quem está servindo?</h1>
          <p>
            Esses dados ficam no seu perfil e ajudam o líder a montar a escala com
            a função certa para cada pessoa. Você pode ajustar depois.
          </p>
        </div>

        <form onSubmit={submit} noValidate>
          <Field
            label="E-mail"
            htmlFor="email"
            hint="Definido pela sua conta Google. O nome não é importado do Google."
          >
            <input
              id="email"
              className="input"
              value={email}
              readOnly
              aria-readonly="true"
              aria-describedby="email-hint"
            />
          </Field>

          <div className="onboard__section">
            <h2>Seus dados</h2>
            <div className="field-grid">
              <Field
                label="Nome completo"
                htmlFor="fullName"
                error={touched ? errors.fullName : undefined}
                hint="Como você quer aparecer na escala."
              >
                <input
                  id="fullName"
                  className={`input ${touched && errors.fullName ? 'input--error' : ''}`}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Ex.: Ana Beatriz Rocha"
                  autoComplete="name"
                  aria-invalid={Boolean(touched && errors.fullName)}
                  aria-describedby={touched && errors.fullName ? 'fullName-error' : 'fullName-hint'}
                />
              </Field>

              <div className="form-grid-2">
                <Field label="Data de nascimento" htmlFor="birthDate" error={touched ? errors.birthDate : undefined}>
                  <input
                    id="birthDate"
                    type="date"
                    className={`input ${touched && errors.birthDate ? 'input--error' : ''}`}
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    min="1920-01-01"
                    aria-invalid={Boolean(touched && errors.birthDate)}
                    aria-describedby={touched && errors.birthDate ? 'birthDate-error' : undefined}
                  />
                </Field>

                <Field label="Sexo" htmlFor="sex" error={touched ? errors.sex : undefined}>
                  <div className="segmented" role="group" aria-label="Sexo" id="sex">
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
            </div>
          </div>

          <div className="onboard__section">
            <h2>Ministério</h2>
            <div className="field-grid">
              <Field label="Unção" htmlFor="uncao" hint="A função eclesiástica, não o cargo no louvor.">
                <select
                  id="uncao"
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

              <Field label="Cargos no louvor" htmlFor="cargos">
                <div className="option-grid" role="group" aria-label="Cargos no louvor" id="cargos">
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
                {touched && errors.cargos && (
                  <p className="field__error" role="alert" style={{ marginTop: 8 }}>
                    {errors.cargos}
                  </p>
                )}
              </Field>
            </div>
            <p className="small muted" style={{ marginTop: 12 }}>
              Pode marcar mais de um. O líder escolhe qual deles vale para cada culto.
            </p>
          </div>

          <div className="demo-note">
            <Info size={14} aria-hidden="true" />
            <span>
              No ambiente real, o e-mail vem da conta Google e não pode ser
              alterado. O nome exibido é sempre o que você digitar aqui.
            </span>
          </div>

          <div className="onboard__foot">
            <button type="submit" className="btn btn--primary btn--block">
              <ShieldCheck size={18} aria-hidden="true" />
              Criar meu perfil
            </button>
            <Link to="/login" className="btn btn--quiet btn--block">
              Já tenho perfil — entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
