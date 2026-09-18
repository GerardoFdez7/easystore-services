import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { isJwtPayload, JwtPayload } from './jwt.handler';

/** Validates JWT payloads after Passport extracts the cookie token. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: { cookies?: { accessToken?: string } }): string | null =>
          request.cookies?.accessToken ?? null,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!isJwtPayload(payload)) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
