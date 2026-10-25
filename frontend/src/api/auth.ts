import { api } from './client';
import type {
  AuthTokens,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  UserProfile,
} from './types/auth';

export function login(body: LoginRequest) {
  return api.post<AuthTokens>('/auth/login', body).then((response) => response.data);
}

export function register(body: RegisterRequest) {
  return api
    .post<UserProfile>('/auth/register', body)
    .then((response) => response.data);
}

export function logout(body: LogoutRequest) {
  return api
    .post<LogoutResponse>('/auth/logout', body)
    .then((response) => response.data);
}

export function getProfile() {
  return api.get<UserProfile>('/user/profile').then((response) => response.data);
}
