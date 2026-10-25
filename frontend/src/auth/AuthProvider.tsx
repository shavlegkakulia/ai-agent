import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as authApi from '../api/auth';
import { toApiError } from '../api/errors';
import { queryKeys } from '../api/queryKeys';
import type { RegisterRequest, UserProfile } from '../api/types/auth';
import {
  AUTH_CHANGED_EVENT,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './tokenStorage';

const AUTH_NOTICE_KEY = 'auth_notice';

type AuthContextValue = {
  accessToken: string | null;
  profile: UserProfile | null | undefined;
  profileError: unknown;
  isProfileLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: RegisterRequest) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refetchProfile: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getAccessToken(),
  );

  useEffect(() => {
    const sync = () => setAccessToken(getAccessToken());
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, []);

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: authApi.getProfile,
    enabled: Boolean(accessToken),
  });

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login({ email, password });
    setTokens(tokens.access_token, tokens.refresh_token);
    setAccessToken(tokens.access_token);
    await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
  };

  const register = (body: RegisterRequest) => authApi.register(body);

  const logout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        try {
          await authApi.logout({ refresh_token: refreshToken });
        } catch (error) {
          const rotatedRefreshToken = getRefreshToken();
          if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            rotatedRefreshToken &&
            rotatedRefreshToken !== refreshToken
          ) {
            await authApi.logout({ refresh_token: rotatedRefreshToken });
            return;
          }
          throw error;
        }
      }
    } catch (error) {
      const info = toApiError(error);
      sessionStorage.setItem(
        AUTH_NOTICE_KEY,
        `Logout request failed: ${info.message}. Local session was cleared.`,
      );
    } finally {
      clearTokens();
      setAccessToken(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        profile: profileQuery.data,
        profileError: profileQuery.error,
        isProfileLoading: profileQuery.isLoading,
        login,
        register,
        logout,
        refetchProfile: () => {
          void profileQuery.refetch();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function readAuthNotice() {
  const notice = sessionStorage.getItem(AUTH_NOTICE_KEY);
  if (notice) {
    sessionStorage.removeItem(AUTH_NOTICE_KEY);
  }
  return notice;
}
