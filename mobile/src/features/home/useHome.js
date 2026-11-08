import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

// Loads the home dashboard payload and exposes a local updater for quick actions
// (affirmation refresh/save) so the card updates without a full reload.
export function useHome() {
  const { authedRequest } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const data = await authedRequest('/home');
      setState({ status: 'ready', data, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message });
    }
  }, [authedRequest]);

  useEffect(() => {
    load();
  }, [load]);

  const patchData = useCallback((patch) => {
    setState((s) => (s.data ? { ...s, data: { ...s.data, ...patch } } : s));
  }, []);

  return { ...state, reload: load, patchData };
}
