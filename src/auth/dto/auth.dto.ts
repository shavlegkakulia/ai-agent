export type UserDTO = {
  id: string;
  email: string;
  name: string;
  last_name: string;
  password: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type RefreshDTO = {
  refresh_token: string;
};
