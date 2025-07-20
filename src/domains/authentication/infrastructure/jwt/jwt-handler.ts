import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = '1d';
const refreshTokenExpiration = '7d';

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

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

  try {
    return jwt.verify(token, jwtSecret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active');
    }
    throw new Error('Token verification failed');
  }
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
