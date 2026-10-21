export const JwtConstants = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expirationTime: process.env.JWT_EXPIRATION_TIME,
  refreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME,
};
