import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../auth/tokenStorage';
import type { AuthTokens } from './types/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Add it to frontend/.env before starting the app.',
  );
}

export const api = axios.create({ baseURL });

const refreshClient = axios.create({ baseURL });

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

function isAuthEndpoint(url: string | undefined) {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh')
  );
}

api.interceptors.request.use((config) => {
  if (isAuthEndpoint(config.url)) {
    return config;
  }
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiBaseUrl() {
  return baseURL;
}

export async function authorizedFetch(url: string, init: RequestInit = {}) {
  const send = (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...init, headers });
  };

  const response = await send(getAccessToken());
  if (response.status !== 401) {
    return response;
  }

  await response.body?.cancel();
  const nextToken = await refreshAccessToken();
  if (!nextToken) {
    clearTokens();
    redirectToLogin();
    return response;
  }

  return send(nextToken);
}

function redirectToLogin() {
  if (
    window.location.pathname !== '/login' &&
    window.location.pathname !== '/register'
  ) {
    window.location.assign('/login');
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<AuthTokens>(
        '/auth/refresh',
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } },
      )
      .then((response) => {
        setTokens(response.data.access_token, response.data.refresh_token);
        return response.data.access_token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      const accessToken = await refreshAccessToken();
      if (!accessToken) {
        clearTokens();
        redirectToLogin();
        return Promise.reject(error);
      }
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    }
    return Promise.reject(error);
  },
);
