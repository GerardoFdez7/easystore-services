import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = '1d';
const refreshTokenExpiration = '30d';

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

const blacklistedTokens = new Set<string>();
const jwtService = new JwtService({ secret: jwtSecret });

export const isTokenBlacklisted = (token: string): boolean =>
  blacklistedTokens.has(token);

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
  return jwtService.sign(payload, {
    expiresIn: jwtExpiration,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  if (isTokenBlacklisted(token)) {
    throw new Error('Token has been already invalidated');
  }

  try {
    return jwtService.verify<JwtPayload>(token);
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error instanceof Error && error.name === 'NotBeforeError') {
      throw new Error('Token not active');
    }
    throw new Error('Token verification failed');
  }
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwtService.sign(payload, {
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

  return jwtService.sign(resetPayload, {
    expiresIn: '15m',
  });
};

// Verify password reset token
export const verifyPasswordResetToken = (
  token: string,
): PasswordResetPayload => {
  if (isTokenBlacklisted(token)) {
    throw new Error('Reset token has been invalidated');
  }

  try {
    const payload = jwtService.verify<PasswordResetPayload>(token);

    if (payload.purpose !== 'password_reset') {
      throw new Error('Invalid token purpose');
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      throw new Error('Invalid reset token');
    }
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      throw new Error('Reset token has expired');
    }
    if (error instanceof Error && error.name === 'NotBeforeError') {
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
  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    path: '/',
  });
};

// Function to clear JWT token cookies
export const clearTokenCookies = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none', // Use 'none' for cross-origin requests
    path: '/',
  });
};

// Function to extract token from cookies
export const extractTokenFromCookies = (req: Request): string | null => {
  const cookies = req.cookies as { accessToken?: string };
  return cookies?.accessToken || null;
};
