import { request } from './api';

// Unauthenticated calls. Authenticated calls go through useAuth().authedRequest so
// token refresh is handled in one place.
export const login = (body) => request('/auth/login', { method: 'POST', body });
export const signup = (body) => request('/auth/signup', { method: 'POST', body });
export const refreshSession = (refreshToken) => request('/auth/refresh', { method: 'POST', body: { refreshToken } });
export const logoutRemote = (refreshToken) => request('/auth/logout', { method: 'POST', body: { refreshToken } });
export const forgotPassword = (email) => request('/auth/forgot-password', { method: 'POST', body: { email } });
export const resetPassword = (body) => request('/auth/reset-password', { method: 'POST', body });
