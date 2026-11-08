import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, request, tokenStore } from '../services/api';
import * as endpoints from '../services/endpoints';

const AuthContext = createContext(null);

// status: 'loading' | 'signedIn' | 'signedOut'
// The access token lives in memory only. The refresh token lives in SecureStore.
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const accessRef = useRef(null);

  const applySession = useCallback(async (session) => {
    accessRef.current = session.accessToken;
    await tokenStore.setRefreshToken(session.refreshToken);
    setUser(session.user);
    setStatus('signedIn');
  }, []);

  const clearSession = useCallback(async () => {
    accessRef.current = null;
    setUser(null);
    setStatus('signedOut');
    await tokenStore.clear();
  }, []);

  // Restore the session on launch. Only an explicit rejection clears the stored
  // token; a network failure leaves it in place so the next launch can retry.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await tokenStore.getRefreshToken();
        if (!stored) {
          if (!cancelled) setStatus('signedOut');
          return;
        }
        const session = await endpoints.refreshSession(stored);
        if (!cancelled) await applySession(session);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          await clearSession();
        } else {
          setStatus('signedOut');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  // Authenticated request with one automatic refresh-and-retry on an expired access token.
  const authedRequest = useCallback(
    async (path, options = {}, retried = false) => {
      try {
        return await request(path, { ...options, token: accessRef.current });
      } catch (err) {
        if (err instanceof ApiError && err.code === 'TOKEN_INVALID' && !retried) {
          const stored = await tokenStore.getRefreshToken();
          if (!stored) {
            await clearSession();
            throw err;
          }
          try {
            await applySession(await endpoints.refreshSession(stored));
          } catch (refreshErr) {
            await clearSession();
            throw refreshErr;
          }
          return authedRequest(path, options, true);
        }
        throw err;
      }
    },
    [applySession, clearSession],
  );

  const signIn = useCallback(
    async (credentials) => applySession(await endpoints.login(credentials)),
    [applySession],
  );

  const signUp = useCallback(
    async (details) => applySession(await endpoints.signup(details)),
    [applySession],
  );

  const signOut = useCallback(async () => {
    try {
      const stored = await tokenStore.getRefreshToken();
      if (stored) await endpoints.logoutRemote(stored);
    } catch {
      // Logout still completes locally if the server is unreachable.
    }
    await clearSession();
  }, [clearSession]);

  const updateProfile = useCallback(
    async (input) => {
      const data = await authedRequest('/users/me', { method: 'PATCH', body: input });
      setUser((u) => ({
        ...u,
        name: data.name,
        timezone: data.timezone,
        profileCompleted: data.profileCompleted,
      }));
      return data;
    },
    [authedRequest],
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      const refreshToken = await tokenStore.getRefreshToken();
      if (!refreshToken) {
        throw new ApiError(401, 'SESSION_INVALID', 'Your session has ended. Please sign in again.');
      }
      return authedRequest('/users/me/password', {
        method: 'PATCH',
        body: { currentPassword, newPassword, refreshToken },
      });
    },
    [authedRequest],
  );

  const loadAvatar = useCallback(async () => {
    const data = await authedRequest('/users/me/avatar', { timeoutMs: 30_000 });
    const avatarUrl = data.image ? `data:${data.mimeType};base64,${data.image}` : null;
    setUser((current) => (current ? { ...current, avatarUrl } : current));
    return avatarUrl;
  }, [authedRequest]);

  const uploadAvatar = useCallback(
    async (asset) => {
      if (!asset.base64) {
        throw new Error('Could not read the selected photo. Please choose another image.');
      }

      await authedRequest('/users/me/avatar', {
        method: 'POST',
        body: { image: asset.base64 },
        timeoutMs: 30_000,
      });
      const avatarUrl = asset.uri;
      setUser((current) => (current ? { ...current, avatarUrl } : current));
      return avatarUrl;
    },
    [authedRequest],
  );

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut, updateProfile, changePassword, loadAvatar, uploadAvatar, authedRequest }),
    [status, user, signIn, signUp, signOut, updateProfile, changePassword, loadAvatar, uploadAvatar, authedRequest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
