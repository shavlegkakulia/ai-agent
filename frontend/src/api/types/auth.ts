export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  name: string;
  last_name: string;
  password: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type LogoutRequest = {
  refresh_token: string;
};

export type LogoutResponse = {
  message: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  last_name: string | null;
};
