import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { SessionService } from '@infrastructure/auth/session/session.service';
import { verify } from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: {
    id: string;
    clientId: string;
    roles: string[];
    permissions: string[];
  };
}

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: Request }>();

    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new UnauthorizedException('JWT secret is not defined');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const decoded: { sub: string } = verify(
        token,
        process.env.JWT_SECRET || '',
      ) as {
        sub: string;
      };
      const sessionId = decoded.sub;

      const session = await this.sessionService.getSession(sessionId);

      if (!session) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      (req as CustomRequest).user = {
        id: String(session.userId),
        clientId: String(session.clientId),
        roles: session.roles,
        permissions: session.permissions,
      };

      return true;
    } catch (_error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(req: {
    headers: { authorization?: string };
  }): string | undefined {
    const authorization = req.headers.authorization;
    if (!authorization) return undefined;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
