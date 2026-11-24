import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  AppState,
  Assignment,
  Integration,
  Provider,
  Service,
  Settings,
  Song,
  User,
} from './types';
import { createSeedState } from './seed';
import { nowISO } from './date';

const STORAGE_KEY = 'adoraplus.state.v1';

function uid(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

type Action =
  | { type: 'sign-in'; userId: string }
  | { type: 'google-email'; email: string }
  | { type: 'cancel-pending' }
  | { type: 'complete-profile'; user: User }
  | { type: 'sign-out' }
  | { type: 'user/update'; userId: string; patch: Partial<User> }
  | { type: 'service/save'; service: Service }
  | { type: 'service/delete'; serviceId: string }
  | { type: 'song/save'; song: Song }
  | { type: 'song/delete'; songId: string }
  | { type: 'integration/update'; provider: Provider; patch: Partial<Integration> }
  | { type: 'settings/patch'; patch: Partial<Settings> }
  | { type: 'cargo/add'; cargo: string }
  | { type: 'cargo/remove'; cargo: string }
  | { type: 'reset' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'sign-in':
      return { ...state, currentUserId: action.userId, pendingEmail: null };
    case 'google-email':
      return { ...state, pendingEmail: action.email, currentUserId: null };
    case 'cancel-pending':
      return { ...state, pendingEmail: null };
    case 'complete-profile':
      return {
        ...state,
        users: [...state.users, action.user],
        currentUserId: action.user.id,
        pendingEmail: null,
      };
    case 'sign-out':
      return { ...state, currentUserId: null, pendingEmail: null };
    case 'user/update':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.userId ? { ...user, ...action.patch } : user,
        ),
      };
    case 'service/save': {
      const exists = state.services.some((service) => service.id === action.service.id);
      return {
        ...state,
        services: exists
          ? state.services.map((service) =>
              service.id === action.service.id ? action.service : service,
            )
          : [...state.services, action.service],
      };
    }
    case 'service/delete':
      return {
        ...state,
        services: state.services.filter((service) => service.id !== action.serviceId),
      };
    case 'song/save': {
      const exists = state.songs.some((song) => song.id === action.song.id);
      return {
        ...state,
        songs: exists
          ? state.songs.map((song) => (song.id === action.song.id ? action.song : song))
          : [...state.songs, action.song],
      };
    }
    case 'song/delete':
      return {
        ...state,
        songs: state.songs.filter((song) => song.id !== action.songId),
        services: state.services.map((service) => ({
          ...service,
          songs: service.songs.filter((entry) => entry.songId !== action.songId),
        })),
      };
    case 'integration/update':
      return {
        ...state,
        integrations: state.integrations.map((integration) =>
          integration.provider === action.provider
            ? { ...integration, ...action.patch }
            : integration,
        ),
      };
    case 'settings/patch':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.patch,
          notifications: {
            ...state.settings.notifications,
            ...(action.patch.notifications ?? {}),
          },
        },
      };
    case 'cargo/add':
      if (state.settings.cargos.includes(action.cargo)) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          cargos: [...state.settings.cargos, action.cargo],
        },
      };
    case 'cargo/remove':
      return {
        ...state,
        settings: {
          ...state.settings,
          cargos: state.settings.cargos.filter((cargo) => cargo !== action.cargo),
        },
        users: state.users.map((user) => ({
          ...user,
          cargos: user.cargos.filter((cargo) => cargo !== action.cargo),
        })),
        services: state.services.map((service) => ({
          ...service,
          assignments: service.assignments.map((assignment) =>
            assignment.role === action.cargo ? { ...assignment, role: 'Sem função' } : assignment,
          ),
        })),
      };
    case 'reset':
      return createSeedState();
    default:
      return state;
  }
}

function loadState(): AppState {
  if (typeof window === 'undefined') return createSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1) return createSeedState();
    return parsed;  } catch {
    return createSeedState();
  }
}

interface AppContextValue {
  state: AppState;
  currentUser: User | null;
  signInWithGoogleEmail: (email: string) => User | null;
  completeProfile: (
    data: Pick<User, 'email' | 'fullName' | 'birthDate' | 'sex' | 'uncao' | 'cargos'>,
  ) => User;
  signOut: () => void;
  cancelPending: () => void;
  updateUser: (userId: string, patch: Partial<User>) => void;
  saveService: (service: Service) => void;
  deleteService: (serviceId: string) => void;
  saveSong: (song: Song) => void;
  deleteSong: (songId: string) => void;
  updateIntegration: (provider: Provider, patch: Partial<Integration>) => void;
  patchSettings: (patch: Partial<Settings>) => void;
  addCargo: (cargo: string) => void;
  removeCargo: (cargo: string) => void;
  resetDemo: () => void;
  newId: (prefix: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in private mode; the app still works for the session.
    }
  }, [state]);

  useEffect(() => {
    const theme = state.settings.theme ?? 'dark';
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const colors = { dark: '#0d1014', light: '#f6f7f9', soft: '#eceae4' } as const;
      meta.setAttribute('content', colors[theme]);
    }
  }, [state.settings.theme]);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === state.currentUserId) ?? null,
    [state.currentUserId, state.users],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      currentUser,
      signInWithGoogleEmail: (email) => {
        const normalized = email.trim().toLowerCase();
        const existing = state.users.find(
          (user) => user.email.toLowerCase() === normalized,
        );
        if (existing) {
          dispatch({ type: 'sign-in', userId: existing.id });
          return existing;
        }
        dispatch({ type: 'google-email', email: normalized });
        return null;
      },
      completeProfile: (data) => {
        const user: User = {
          id: uid('u'),
          email: data.email.trim().toLowerCase(),
          fullName: data.fullName.trim(),
          birthDate: data.birthDate,
          sex: data.sex,
          uncao: data.uncao,
          cargos: data.cargos,
          permissions: [],
          createdAt: nowISO(),
          active: true,
        };
        dispatch({ type: 'complete-profile', user });
        return user;
      },
      signOut: () => dispatch({ type: 'sign-out' }),
      cancelPending: () => dispatch({ type: 'cancel-pending' }),
      updateUser: (userId, patch) => dispatch({ type: 'user/update', userId, patch }),
      saveService: (service) => dispatch({ type: 'service/save', service }),
      deleteService: (serviceId) => dispatch({ type: 'service/delete', serviceId }),
      saveSong: (song) => dispatch({ type: 'song/save', song }),
      deleteSong: (songId) => dispatch({ type: 'song/delete', songId }),
      updateIntegration: (provider, patch) =>
        dispatch({ type: 'integration/update', provider, patch }),
      patchSettings: (patch) => dispatch({ type: 'settings/patch', patch }),
      addCargo: (cargo) => dispatch({ type: 'cargo/add', cargo }),
      removeCargo: (cargo) => dispatch({ type: 'cargo/remove', cargo }),
      resetDemo: () => dispatch({ type: 'reset' }),
      newId: (prefix) => uid(prefix),
    }),
    [state, currentUser],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

export function assignmentsFor(userId: string, services: Service[]): {
  service: Service;
  assignment: Assignment;
}[] {
  return services.flatMap((service) => {
    const assignment = service.assignments.find((entry) => entry.userId === userId);
    return assignment ? [{ service, assignment }] : [];
  });
}

export function serviceSongs(service: Service, songs: Song[]) {
  return service.songs
    .map((entry) => {
      const song = songs.find((item) => item.id === entry.songId);
      return song ? { ...song, serviceKey: entry.key } : null;
    })
    .filter((song): song is Song & { serviceKey: string } => Boolean(song));
}
