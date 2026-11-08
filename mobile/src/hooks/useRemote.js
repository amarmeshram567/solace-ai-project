import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

// Loads an authenticated GET endpoint. Pass enabled=false to defer loading.
// Re-runs when `path` changes, so query-string filters reload automatically.
export function useRemote(path, { enabled = true } = {}) {
  const { authedRequest } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const data = await authedRequest(path);
      setState({ status: 'ready', data, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message });
    }
  }, [authedRequest, path]);

  useEffect(() => {
    if (enabled) load();
  }, [load, enabled]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: load, setData };
}
