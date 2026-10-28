import { createHash, createHmac } from 'node:crypto';
import * as bcrypt from 'bcrypt';
export const hashString = (refreshToken: string) => {
  return createHash('sha256').update(refreshToken).digest('hex');
};

export const bcryptHash = (password: string) => {
  return bcrypt.hash(password, BcryptSalt);
};

export const bcryptCompare = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hmacString = (data: string, secret: string) => {
  return createHmac('sha256', secret).update(data).digest('hex');
};

export const BcryptSalt = 12; // 12 is the number of rounds
