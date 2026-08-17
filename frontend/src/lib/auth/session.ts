import {
  clearAuthTokens,
  persistAuthTokens,
  type AuthTokens,
} from "./tokens";

type SessionClearedListener = () => void;
type SessionPersistedListener = (accessToken: string) => void;

let sessionClearedListener: SessionClearedListener | null = null;
let sessionPersistedListener: SessionPersistedListener | null = null;

export function onAuthSessionCleared(listener: SessionClearedListener): void {
  sessionClearedListener = listener;
}

export function onAuthSessionPersisted(listener: SessionPersistedListener): void {
  sessionPersistedListener = listener;
}

export function persistAuthSession(tokens: AuthTokens): void {
  persistAuthTokens(tokens);
  sessionPersistedListener?.(tokens.accessToken);
}

export function clearAuthSession(): void {
  clearAuthTokens();
  sessionClearedListener?.();
}
