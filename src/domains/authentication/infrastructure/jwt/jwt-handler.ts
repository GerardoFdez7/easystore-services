import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = '1d';
const refreshTokenExpiration = '7d';

const blacklistedTokens = new Set<string>();

export interface JwtPayload {
  email: string;
  id: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiration,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  if (blacklistedTokens.has(token)) {
    throw new Error('Token has been invalidated');
  }
  return jwt.verify(token, jwtSecret) as JwtPayload;
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: refreshTokenExpiration,
  });
};

// Function to invalidate a token by adding it to the blacklist
export const invalidateToken = (token: string): void => {
  // TO DO: Repalce this list with a TokenBlockList in Redis
  blacklistedTokens.add(token);
};
