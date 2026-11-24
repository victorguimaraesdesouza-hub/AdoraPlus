import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Info, KeyRound, ShieldCheck, UserPlus } from 'lucide-react';
import { useApp } from '../lib/store';
import { GoogleMark, StaffLines } from '../components/Marks';
import { Avatar } from '../components/Avatar';
import { Logo } from '../components/Logo';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function decodeJwt(token: string): { email?: string } {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {};
  }
}

export default function Login() {
  const { state, signInWithGoogleEmail } = useApp();
  const navigate = useNavigate();
  const googleRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState('');

  const ana = state.users.find((user) => user.id === 'u-ana');
  const joao = state.users.find((user) => user.id === 'u-joao');

  useEffect(() => {
    if (!CLIENT_ID || !googleRef.current) return;
    const existing = document.getElementById('gsi-script');
    const mount = () => {
      const google = (window as unknown as { google?: any }).google;
      if (!google?.accounts?.id) return;
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: { credential: string }) => {
          const payload = decodeJwt(response.credential);
          if (!payload.email) {
            setNotice('Não foi possível ler sua conta Google. Tente novamente.');
            return;
          }
          const user = signInWithGoogleEmail(payload.email);
          navigate(user ? '/' : '/entrar/novo');
        },
        locale: 'pt-BR',
      });
      google.accounts.id.renderButton(googleRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        locale: 'pt-BR',
        width: 360,
      });
    };
    if (existing) {
      mount();
    } else {
      const script = document.createElement('script');
      script.id = 'gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = mount;
      script.onerror = () => setNotice('Não foi possível carregar o login Google. Verifique a conexão.');
      document.head.appendChild(script);
    }
    return () => {
      const google = (window as unknown as { google?: any }).google;
      google?.accounts?.id?.cancel?.();
    };
  }, [signInWithGoogleEmail, navigate]);

  const enterDemo = (email: string) => {
    const user = signInWithGoogleEmail(email);
    if (user) {
      navigate('/');
    } else {
      navigate('/entrar/novo');
    }
  };

  return (
    <div className="auth">
      <section className="auth__brand" aria-labelledby="auth-claim">
        <div className="auth__staff" aria-hidden="true">
          <StaffLines />
        </div>

        <Logo />

        <div className="auth__claim">
          <h1 id="auth-claim">
            Cada culto
            <br />
            no seu <em>lugar</em>.
          </h1>
          <p>
            Escala, equipe e repertório do ministério em uma só página. Feita para
            ser usada no celular, na correria de quem serve.
          </p>
        </div>

        <div className="auth__foot">
          <span>Demonstração · dados sintéticos</span>
          <span>Feito para o ministério de louvor</span>
        </div>
      </section>

      <section className="auth__panel">
        <div className="auth__card">
          <h2>Entrar</h2>
          <p>
            O acesso é feito apenas com uma conta Google. Seu nome no perfil é
            definido por você, no primeiro acesso.
          </p>

          {CLIENT_ID ? (
            <div ref={googleRef} className="google-mount" />
          ) : (
            <button
              type="button"
              className="google-btn"
              onClick={() =>
                setNotice(
                  'O login Google ainda não está configurado neste ambiente. Enquanto isso, use uma das contas de demonstração abaixo.',
                )
              }
              aria-describedby="google-note"
            >
              <GoogleMark />
              Continuar com Google
            </button>
          )}

          {notice && (
            <div className="demo-note" role="status" style={{ marginTop: 12 }}>
              <Info size={14} aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}

          <p className="auth__legal" id="google-note">
            Ao entrar, você concorda com o uso dos dados do perfil para montar a
            escala do ministério. Nada é publicado fora da igreja.
          </p>

          <div className="auth__links">
            <Link to="/recuperar">
              <KeyRound size={14} aria-hidden="true" />
              Recuperar acesso
            </Link>
            <span aria-hidden="true">·</span>
            <span>Sua conta Google é a única credencial.</span>
          </div>

          <div className="divider">Explorar demonstração</div>

          <div className="demo-entries">
            {ana && (
              <button type="button" className="demo-entry" onClick={() => enterDemo(ana.email)}>
                <Avatar user={ana} />
                <span className="demo-entry__body">
                  <strong>Ana Beatriz · Administradora</strong>
                  <span>Vê a escala completa, cria cultos e delega permissões</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
            {joao && (
              <button type="button" className="demo-entry" onClick={() => enterDemo(joao.email)}>
                <Avatar user={joao} />
                <span className="demo-entry__body">
                  <strong>João Marcos · Membro</strong>
                  <span>Vê a própria participação, o calendário e o repertório do culto</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="demo-entry"
              onClick={() => enterDemo('novo.membro@demo.adoraplus.app')}
            >
              <span className="avatar avatar--sm avatar--sky" aria-hidden="true">
                <UserPlus size={15} />
              </span>
              <span className="demo-entry__body">
                <strong>Criar um perfil de demonstração</strong>
                <span>Percorre o cadastro completo de um novo membro</span>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="demo-note">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>
              Ambiente de demonstração: nenhuma conta Google real é autenticada e
              todos os nomes, cultos e músicas são fictícios. O e-mail é a única
              informação vinda do Google.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
