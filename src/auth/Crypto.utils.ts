import { createHash } from 'node:crypto';
import * as bcrypt from 'bcrypt';
export const hashRefreshToken = (refreshToken: string) => {
  return createHash('sha256').update(refreshToken).digest('hex');
};

export const BcryptHash = (password: string) => {
  return bcrypt.hash(password, BcryptSalt);
};

export const BcryptCompare = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const BcryptSalt = 12; // 12 is the number of rounds
