const GOOGLE_SCRIPT_ID = 'salmo-google-identity';

export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

export function isGoogleConfigured(): boolean {
  return Boolean(googleClientId);
}

function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Sem navegador'));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar o Google'))); 
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar o Google'));
    document.head.appendChild(script);
  });
}

export async function requestGoogleAccount(): Promise<{ email: string }> {
  if (!googleClientId) throw new Error('Google não configurado');
  await loadGoogleScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Google Identity indisponível');

  return new Promise((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: googleClientId,
      scope: 'openid email profile',
      callback: async (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description ?? 'Não foi possível concluir o acesso.'));
          return;
        }
        try {
          const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          if (!profileResponse.ok) throw new Error('Não foi possível ler a conta Google.');
          const profile = (await profileResponse.json()) as { email?: string };
          if (!profile.email) throw new Error('A conta Google não retornou um e-mail.');
          resolve({ email: profile.email });
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Falha ao ler a conta Google.'));
        }
      },
    });
    client.requestAccessToken();
  });
}
