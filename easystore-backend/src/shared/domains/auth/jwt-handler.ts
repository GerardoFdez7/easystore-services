// shared/domains/auth/jwt-handler.ts
import * as jwt from 'jsonwebtoken';

export class JwtHandler {
  private readonly accessSecret = 'defaultSecret';
  private readonly accessExpiresIn = '15m';

  generateAccessToken(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    });
  }

  verifyAccessToken(token: string): Record<string, unknown> {
    return jwt.verify(token, this.accessSecret) as Record<string, unknown>;
  }
}
