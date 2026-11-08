import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Only public configuration is read here. Secrets stay on the server.
const nativeApiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000/api/v1';
const webApiUrl =
  process.env.EXPO_PUBLIC_API_URL_WEB ?? nativeApiUrl.replace('10.0.2.2', 'localhost');
export const API_URL = Platform.OS === 'web' ? webApiUrl : nativeApiUrl;

const REFRESH_KEY = 'solace.refreshToken';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// SecureStore has no web implementation; browser sessions use localStorage.
export const tokenStore = {
  getRefreshToken: async () => {
    if (Platform.OS === 'web') return globalThis.localStorage.getItem(REFRESH_KEY);
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  setRefreshToken: async (token) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage.setItem(REFRESH_KEY, token);
      return;
    }
    return SecureStore.setItemAsync(REFRESH_KEY, token);
  },
  clear: async () => {
    if (Platform.OS === 'web') {
      globalThis.localStorage.removeItem(REFRESH_KEY);
      return;
    }
    return SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Low-level JSON request. Throws ApiError with a user-presentable message.
 * Network failures are reported as NETWORK_ERROR so the UI can offer a retry.
 */
export async function request(path, { method = 'GET', body, token, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err?.name === 'AbortError';
    clearTimeout(timer);
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      timedOut
        ? 'The server is taking too long to respond. Please try again.'
        : "Can't reach Solace right now. Check your connection and try again.",
    );
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    if (controller.signal.aborted) {
      clearTimeout(timer);
      throw new ApiError(0, 'NETWORK_ERROR', 'The server is taking too long to respond. Please try again.');
    }
    // Non-JSON body (e.g. proxy error page). Handled below by status.
  }
  clearTimeout(timer);

  if (!response.ok || !json?.success) {
    const err = json?.error;
    throw new ApiError(
      response.status,
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? 'Something went wrong. Please try again.',
      err?.details,
    );
  }

  return json.data;
}

/** Health check used by the foundation screen to prove the app ↔ API link works. */
export function checkHealth() {
  return request('/health', { timeoutMs: 5000 });
}
