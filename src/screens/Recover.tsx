import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, KeyRound } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function Recover() {
  return (
    <div className="auth">
      <section className="auth__brand" aria-labelledby="recover-title">
        <Logo />
        <div className="auth__claim">
          <h1 id="recover-title">
            O acesso é a sua conta <em>Google</em>.
          </h1>
          <p>
            O Adora+ não guarda senhas. Se você esqueceu a senha, a recuperação
            acontece na própria conta Google — e volta a valer para o ministério
            inteiro.
          </p>
        </div>
        <div className="auth__foot">
          <span>Sem senha local</span>
          <span>Autenticação exclusiva via Google</span>
        </div>
      </section>

      <section className="auth__panel">
        <div className="auth__card">
          <div className="recover-icon" aria-hidden="true">
            <KeyRound size={22} />
          </div>
          <h2>Recuperar acesso</h2>
          <p>
            Entre na sua conta Google normalmente. Se necessário, recupere a senha
            na página de segurança do Google e depois volte ao Adora+.
          </p>

          <a
            className="btn btn--primary btn--block"
            style={{ marginTop: 22 }}
            href="https://accounts.google.com/signin/recovery"
            target="_blank"
            rel="noreferrer"
          >
            Abrir recuperação do Google
            <ExternalLink size={16} aria-hidden="true" />
          </a>

          <Link to="/login" className="btn btn--quiet btn--block" style={{ marginTop: 10 }}>
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar para o login
          </Link>

          <div className="demo-note">
            <span>
              Neste ambiente de demonstração, use as contas de exemplo da tela de
              login. Nenhuma conta Google real é autenticada.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
