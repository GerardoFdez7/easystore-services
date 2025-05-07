// src/shared/jwt-handler.ts
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.jwtSecret || 'yourSecretKey'; // ⚠️ Usa .env en producción
const jwtExpiration = '1h'; // o '15m', '7d', etc.

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
  return jwt.verify(token, jwtSecret) as JwtPayload;
};
