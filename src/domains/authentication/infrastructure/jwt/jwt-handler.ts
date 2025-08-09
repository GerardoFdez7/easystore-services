import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = '1d';
const refreshTokenExpiration = '30d';

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

const blacklistedTokens = new Set<string>();

export interface JwtPayload {
  email: string;
  authIdentityId: string;
  tenantId: string;
  customerId?: string;
  employeeId?: string;
}

export interface PasswordResetPayload {
  email: string;
  authIdentityId: string;
  purpose: 'password_reset';
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiration,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  if (blacklistedTokens.has(token)) {
    throw new Error('Token has been already invalidated');
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

// Generate password reset token with 15-minute expiration
export const generatePasswordResetToken = (
  payload: Omit<PasswordResetPayload, 'purpose'>,
): string => {
  const resetPayload: PasswordResetPayload = {
    ...payload,
    purpose: 'password_reset',
  };

  return jwt.sign(resetPayload, jwtSecret, {
    expiresIn: '15m',
  });
};

// Verify password reset token
export const verifyPasswordResetToken = (
  token: string,
): PasswordResetPayload => {
  if (blacklistedTokens.has(token)) {
    throw new Error('Reset token has been invalidated');
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as PasswordResetPayload;

    if (payload.purpose !== 'password_reset') {
      throw new Error('Invalid token purpose');
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid reset token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Reset token has expired');
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error('Reset token not active');
    }
    throw new Error('Reset token verification failed');
  }
};

// Function to invalidate a token by adding it to the blacklist
export const invalidateToken = (token: string): void => {
  // TO DO: Replace this list with a TokenBlockList in Redis
  blacklistedTokens.add(token);
};

// Function to set JWT tokens as httpOnly secure cookies
export const setTokenCookies = (res: Response, accessToken: string): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: isDevelopment ? 'none' : 'strict', // Use 'none' for development to support Apollo Playground
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    path: '/',
  });
};

// Function to clear JWT token cookies
export const clearTokenCookies = (res: Response): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: isDevelopment ? 'none' : 'strict',
    path: '/',
  });
};

// Function to extract token from cookies
export const extractTokenFromCookies = (req: Request): string | null => {
  const cookies = req.cookies as { accessToken?: string };
  return cookies?.accessToken || null;
};
