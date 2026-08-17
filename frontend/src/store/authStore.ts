import { create } from "zustand";
import { fetchMe, loginUser, logoutUser, registerUser } from "@/features/auth/api";
import type { LoginInput, RegisterInput } from "@/features/auth/schemas";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  hasAuthSession,
  onAuthSessionCleared,
  onAuthSessionPersisted,
} from "@/lib/auth";
import type { MeResponse, User } from "@/types/auth";

type AuthState = {
  token: string | null;
  user: User | null;
  organizations: MeResponse["organizations"];
  initialized: boolean;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

async function loadSession() {
  const me = await fetchMe();
  return {
    token: getAccessToken(),
    user: me.user,
    organizations: me.organizations,
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: getAccessToken(),
  user: null,
  organizations: [],
  initialized: false,
  loading: false,
  error: null,
  setError: (error) => set({ error }),
  initialize: async () => {
    if (!hasAuthSession()) {
      set({ initialized: true, token: null, user: null, organizations: [] });
      return;
    }

    set({ loading: true, error: null });

    try {
      const session = await loadSession();
      set({
        ...session,
        initialized: true,
        loading: false,
      });
    } catch {
      clearAuthSession();
      set({
        token: null,
        user: null,
        organizations: [],
        initialized: true,
        loading: false,
      });
    }
  },
  register: async (input) => {
    set({ loading: true, error: null });

    try {
      await registerUser(input);
      const session = await loadSession();
      set({
        ...session,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Registration failed",
      });
      throw error;
    }
  },
  login: async (input) => {
    set({ loading: true, error: null });

    try {
      await loginUser(input);
      const session = await loadSession();
      set({
        ...session,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  },
  logout: async () => {
    const refreshToken = getRefreshToken();

    try {
      await logoutUser(refreshToken);
    } catch {
      // Local session is still cleared below.
    } finally {
      clearAuthSession();
      set({
        token: null,
        user: null,
        organizations: [],
        error: null,
      });
    }
  },
  refreshMe: async () => {
    if (!hasAuthSession()) {
      return;
    }

    const session = await loadSession();
    set(session);
  },
}));

onAuthSessionCleared(() => {
  useAuthStore.setState({
    token: null,
    user: null,
    organizations: [],
  });
});

onAuthSessionPersisted((accessToken) => {
  useAuthStore.setState({ token: accessToken });
});
